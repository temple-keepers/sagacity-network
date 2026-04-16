import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getAvailableSlots, createCalendarEvent } from "@/lib/google-calendar";
import {
  sendBookingConfirmationToProspect,
  sendBookingNotificationToDenise,
  type Booking,
  type Lead,
} from "@/lib/emails/booking-emails";

const SLOT_MS = 30 * 60 * 1000;

interface CreateBody {
  name?: string;
  email?: string;
  business?: string;
  message?: string;
  slotStart?: string;
  leadId?: string;
}

function validate(body: CreateBody) {
  const errors: string[] = [];
  if (!body.name || body.name.trim().length < 2) errors.push("name (min 2 chars)");
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push("email");
  if (!body.slotStart || Number.isNaN(Date.parse(body.slotStart))) errors.push("slotStart (ISO datetime)");
  if (body.leadId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.leadId)) {
    errors.push("leadId (uuid)");
  }
  if (body.message && body.message.length > 300) errors.push("message (max 300 chars)");
  return errors;
}

export async function POST(request: NextRequest) {
  let body: CreateBody;
  try {
    body = (await request.json()) as CreateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const errors = validate(body);
  if (errors.length) {
    return NextResponse.json(
      { error: `Invalid fields: ${errors.join(", ")}` },
      { status: 400 }
    );
  }

  const slotStart = new Date(body.slotStart!);
  const slotEnd = new Date(slotStart.getTime() + SLOT_MS);
  const now = new Date();

  if (slotStart.getTime() < now.getTime()) {
    return NextResponse.json({ error: "Slot is in the past" }, { status: 400 });
  }

  // Re-verify the slot is still available. This narrows the race window; the
  // unique index on (slot_start) where status='confirmed' closes it.
  const available = await getAvailableSlots(slotStart, now);
  const slotIso = slotStart.toISOString();
  const isAvailable = available.some((d) => d.toISOString() === slotIso);
  if (!isAvailable) {
    return NextResponse.json(
      { error: "This slot has just been taken. Please choose another time.", code: "SLOT_TAKEN" },
      { status: 409 }
    );
  }

  // Fetch lead context if provided
  let lead: Lead | null = null;
  let leadScore: number | null = null;
  let leadBand: string | null = null;
  if (body.leadId) {
    const { data } = await getSupabaseAdmin()
      .from("leads")
      .select("id, score, band, q1, q2, q3, q4, q5, q6, q7, q8")
      .eq("id", body.leadId)
      .maybeSingle();
    if (data) {
      lead = data;
      leadScore = data.score;
      leadBand = data.band;
    }
  }

  const cancelToken = crypto.randomBytes(24).toString("hex");
  const meetingLink = process.env.MEETING_LINK ?? "";

  // Insert the booking row. The unique index catches concurrent inserts.
  const { data: inserted, error: insertError } = await getSupabaseAdmin()
    .from("bookings")
    .insert({
      lead_id: body.leadId ?? null,
      name: body.name!.trim(),
      email: body.email!.trim().toLowerCase(),
      business: body.business?.trim() || null,
      message: body.message?.trim() || null,
      slot_start: slotStart.toISOString(),
      slot_end: slotEnd.toISOString(),
      meeting_link: meetingLink,
      status: "confirmed",
      score: leadScore,
      band: leadBand,
      cancel_token: cancelToken,
    })
    .select("*")
    .single();

  if (insertError) {
    // Unique violation on slot_start → slot was just taken
    if (insertError.code === "23505") {
      return NextResponse.json(
        { error: "This slot has just been taken. Please choose another time.", code: "SLOT_TAKEN" },
        { status: 409 }
      );
    }
    console.error("[booking/create] insert error:", insertError);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }

  const booking: Booking = {
    id: inserted.id,
    name: inserted.name,
    email: inserted.email,
    business: inserted.business,
    message: inserted.message,
    slot_start: inserted.slot_start,
    slot_end: inserted.slot_end,
    meeting_link: inserted.meeting_link,
    cancel_token: inserted.cancel_token,
  };

  // Create Google Calendar event. If this fails, roll back the booking row —
  // we don't want confirmed bookings that aren't in Denise's calendar.
  let googleEventId: string | null = null;
  try {
    const { eventId } = await createCalendarEvent({
      summary: `Digital Clarity Call — ${booking.name}`,
      description: [
        "Booked via sagacitynetwork.net",
        booking.business ? `Business: ${booking.business}` : "",
        booking.message ? `\nTheir message:\n${booking.message}` : "",
        lead?.score ? `\nAssessment: ${lead.score}/100 (${lead.band})` : "",
        `\nJoin: ${booking.meeting_link}`,
      ].filter(Boolean).join("\n"),
      startUtc: slotStart,
      endUtc: slotEnd,
      attendeeEmail: booking.email,
      attendeeName: booking.name,
    });
    googleEventId = eventId;
    await getSupabaseAdmin()
      .from("bookings")
      .update({ google_event_id: eventId })
      .eq("id", booking.id);
  } catch (err) {
    console.error("[booking/create] calendar event failed, rolling back booking:", err);
    await getSupabaseAdmin().from("bookings").delete().eq("id", booking.id);
    return NextResponse.json(
      { error: "Could not create the calendar event. Please try again." },
      { status: 500 }
    );
  }

  // Send emails in parallel — don't block the response if one fails, but log.
  Promise.allSettled([
    sendBookingConfirmationToProspect(booking, lead),
    sendBookingNotificationToDenise(booking, lead),
  ]).then((results) => {
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        const which = i === 0 ? "confirmation to prospect" : "notification to Denise";
        console.error(`[booking/create] failed to send ${which}:`, r.reason);
      }
    });
  });

  return NextResponse.json(
    {
      bookingId: booking.id,
      slotStart: booking.slot_start,
      slotEnd: booking.slot_end,
      meetingLink: booking.meeting_link,
      googleEventId,
    },
    { status: 201 }
  );
}
