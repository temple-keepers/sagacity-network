import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/academy/stripe";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export async function POST(req: NextRequest) {
  if (!isAcademyEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { courseSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const courseSlug = body.courseSlug;
  if (!courseSlug || typeof courseSlug !== "string") {
    return NextResponse.json({ error: "courseSlug is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, price_cents, status")
    .eq("slug", courseSlug)
    .eq("status", "published")
    .maybeSingle();

  if (courseError) {
    console.error("Course lookup failed:", courseError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You are already enrolled" }, { status: 409 });
  }

  const origin = req.headers.get("origin") || "https://sagacitynetwork.net";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        course_id: course.id,
        course_slug: course.slug,
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: course.title },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/academy/my-learning?welcome=1`,
      cancel_url: `${origin}/academy/${course.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", msg);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
