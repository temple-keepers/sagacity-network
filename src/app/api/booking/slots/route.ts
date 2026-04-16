import { NextRequest, NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/google-calendar";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Cache slot lookups for 5 min — Google Calendar changes aren't constant.
export const revalidate = 300;

const MAX_DAYS_AHEAD = 60;

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get("date");
  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json(
      { error: "Missing or invalid ?date — expected YYYY-MM-DD" },
      { status: 400 }
    );
  }

  // Parse the date as a London-local midnight (we re-compute slot times in the lib)
  const date = new Date(`${dateParam}T12:00:00Z`); // midday UTC — safely inside the target calendar day in London regardless of BST/GMT
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // Reject dates more than MAX_DAYS_AHEAD ahead or in the past
  const now = new Date();
  const maxDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return NextResponse.json({ error: "Date is in the past" }, { status: 400 });
  }
  if (date > maxDate) {
    return NextResponse.json(
      { error: `Date is more than ${MAX_DAYS_AHEAD} days ahead` },
      { status: 400 }
    );
  }

  try {
    // Get slots from Google Calendar
    let slots = await getAvailableSlots(date, now);

    // Remove slots where a confirmed booking already exists (defence-in-depth)
    if (slots.length > 0) {
      const windowStart = slots[0].toISOString();
      const windowEnd = new Date(
        slots[slots.length - 1].getTime() + 30 * 60_000
      ).toISOString();
      const { data: existingBookings } = await getSupabaseAdmin()
        .from("bookings")
        .select("slot_start")
        .eq("status", "confirmed")
        .gte("slot_start", windowStart)
        .lte("slot_start", windowEnd);
      const takenIsoSet = new Set((existingBookings ?? []).map((b) => b.slot_start));
      slots = slots.filter((s) => !takenIsoSet.has(s.toISOString()));
    }

    // Remove slots on blocked dates (availability_overrides)
    const { data: overrides } = await getSupabaseAdmin()
      .from("availability_overrides")
      .select("date, blocked")
      .eq("date", dateParam)
      .eq("blocked", true)
      .maybeSingle();
    if (overrides) {
      return NextResponse.json({ slots: [] });
    }

    return NextResponse.json({ slots: slots.map((s) => s.toISOString()) });
  } catch (err) {
    console.error("[booking/slots] error:", err);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
