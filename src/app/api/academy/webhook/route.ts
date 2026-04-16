import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getStripe, getWebhookSecret } from "@/lib/academy/stripe";
import { sendEnrolmentEmail } from "@/lib/emails/academy-enrolment";
import type Stripe from "stripe";

// Stripe requires the raw body for signature verification.
export const dynamic = "force-dynamic";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service env vars missing");
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, getWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "verification failed";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = serviceClient();

  // Idempotency: if we've seen this event id before, do nothing.
  const { data: seen } = await db
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();
  if (seen) return NextResponse.json({ ok: true, deduped: true });

  // Record the event, then apply side-effect. If side-effect fails, delete the
  // event row so Stripe's retry will try again.
  const { error: insertEventError } = await db
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, type: event.type });
  if (insertEventError) {
    console.error("Event row insert failed:", insertEventError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(db, event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(db, event.data.object as Stripe.Charge);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook side-effect failed:", err);
    // rollback the idempotency row so the retry can re-process
    await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  db: ReturnType<typeof serviceClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const courseId = session.metadata?.course_id;
  const courseSlug = session.metadata?.course_slug;
  if (!userId || !courseId) throw new Error("Missing metadata on session");

  const { data: enrolment, error } = await db
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        source: "stripe",
        status: "active",
        stripe_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null,
        amount_paid_cents: session.amount_total ?? 0,
      },
      { onConflict: "stripe_session_id" }
    )
    .select("id")
    .single();

  if (error) throw error;

  // Look up course title + learner profile for the email
  const { data: course } = await db
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();

  const { data: learner } = await db.auth.admin.getUserById(userId);

  await sendEnrolmentEmail({
    learnerName: (learner?.user?.user_metadata?.full_name as string) ?? null,
    learnerEmail: learner?.user?.email ?? session.customer_details?.email ?? "unknown",
    courseTitle: course?.title ?? courseSlug ?? "(unknown course)",
    amountPaidPence: session.amount_total ?? 0,
    stripeSessionUrl: `https://dashboard.stripe.com/payments/${session.payment_intent}`,
    adminEnrolmentsUrl: "https://sagacitynetwork.net/admin/enrolments",
  });

  return enrolment;
}

async function handleChargeRefunded(
  db: ReturnType<typeof serviceClient>,
  charge: Stripe.Charge
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  // Find the checkout session for this payment intent
  const stripe = getStripe();
  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  const session = sessions.data[0];
  if (!session) return;

  const { error } = await db
    .from("enrollments")
    .update({ status: "refunded" })
    .eq("stripe_session_id", session.id);
  if (error) throw error;
}
