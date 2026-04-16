import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { sendCancellationEmail, type Booking } from "@/lib/emails/booking-emails";

/**
 * GET /api/booking/cancel?id={bookingId}&token={cancel_token}
 *
 * Renders a simple HTML confirmation page. Idempotent — visiting twice is
 * safe. The cancel_token is a per-booking secret stored on the row.
 *
 * Included in both the prospect's confirmation email (so they can self-cancel)
 * and Denise's notification email (so she can cancel from her inbox).
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const token = request.nextUrl.searchParams.get("token");

  if (!id || !token) {
    return html("Missing parameters", "This cancel link is incomplete.", 400);
  }

  const { data: booking, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !booking) {
    return html("Not found", "This booking could not be found.", 404);
  }

  // Constant-time compare
  const expected = Buffer.from(booking.cancel_token);
  const provided = Buffer.from(token);
  const ok =
    expected.length === provided.length &&
    crypto.timingSafeEqual(expected, provided);
  if (!ok) {
    return html("Invalid link", "This cancel link is invalid.", 403);
  }

  if (booking.status !== "confirmed") {
    // Already cancelled / completed — idempotent no-op
    return html(
      "Already cancelled",
      `This booking is already ${booking.status}.`,
      200
    );
  }

  // Update DB first (we'd rather have a cancelled row + orphan calendar event
  // than a calendar deletion with a row still marked 'confirmed')
  const { error: updateError } = await getSupabaseAdmin()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "confirmed"); // optimistic lock

  if (updateError) {
    console.error("[booking/cancel] update error:", updateError);
    return html("Error", "Something went wrong — please try again.", 500);
  }

  // Delete Google Calendar event (ignore 404/410 in the lib)
  if (booking.google_event_id) {
    try {
      await deleteCalendarEvent(booking.google_event_id);
    } catch (err) {
      console.error("[booking/cancel] calendar delete failed:", err);
      // Don't block — booking is already marked cancelled.
    }
  }

  // Send cancellation email to prospect (best effort)
  sendCancellationEmail({
    id: booking.id,
    name: booking.name,
    email: booking.email,
    business: booking.business,
    message: booking.message,
    slot_start: booking.slot_start,
    slot_end: booking.slot_end,
    meeting_link: booking.meeting_link ?? "",
    cancel_token: booking.cancel_token,
  } satisfies Booking).catch((err) => {
    console.error("[booking/cancel] cancellation email failed:", err);
  });

  return html(
    "Booking cancelled",
    `Your Digital Clarity Call has been cancelled. ${booking.name !== "Denise" ? "Denise has been notified." : ""}`,
    200
  );
}

function html(title: string, message: string, status: number): NextResponse {
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>${title} — Sagacity Network</title><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:6rem auto;padding:2rem;text-align:center;color:#1a1a1a;line-height:1.6">
<h1 style="font-size:1.5rem;margin-bottom:1rem">${title}</h1>
<p style="color:#555">${message}</p>
<p style="margin-top:2rem"><a href="https://sagacitynetwork.net/book" style="color:#7B3FA0;text-decoration:none">Book another time →</a></p>
</body></html>`;
  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
