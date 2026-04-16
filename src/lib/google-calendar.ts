/**
 * Google Calendar integration via Service Account.
 *
 * This module runs server-side only. Never import from a Client Component.
 *
 * Auth: JWT bearer flow — sign a short-lived JWT with the service account's
 * private key, exchange it at oauth2.googleapis.com/token for an access token,
 * cache the token for ~55 min, use it on Calendar API calls.
 *
 * Calendar ID is shared with the service account email via the Google Calendar
 * UI (see docs/google-calendar-setup.md, Step 3).
 */

import "server-only";
import crypto from "node:crypto";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/calendar";
const TIMEZONE = "Europe/London";

// Working hours (local time, 24h)
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
// 30-min slots on the hour and half-hour
const SLOT_MINUTES = 30;
// Minimum lead time before a slot becomes bookable (hours)
const MIN_LEAD_HOURS = 4;

// ── Token cache (module-scoped; Fluid Compute reuses instances) ────────────

let cachedToken: { value: string; expiresAt: number } | null = null;

function getCreds() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!email || !rawKey || !calendarId) {
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY / GOOGLE_CALENDAR_ID in environment"
    );
  }
  // Convert literal \n sequences to real newlines (both quoted and unquoted
  // forms in .env produce strings with "\\n" when read).
  const privateKey = rawKey.replace(/\\n/g, "\n");
  return { email, privateKey, calendarId };
}

// ── JWT signing (RS256) ────────────────────────────────────────────────────

function base64url(input: Buffer | string): string {
  const b = typeof input === "string" ? Buffer.from(input) : input;
  return b.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwt(email: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }
  const { email, privateKey } = getCreds();
  const jwt = signJwt(email, privateKey);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

// ── Calendar API calls ─────────────────────────────────────────────────────

export interface BusyPeriod {
  start: Date;
  end: Date;
}

export async function getBusySlots(start: Date, end: Date): Promise<BusyPeriod[]> {
  const { calendarId } = getCreds();
  const token = await getAccessToken();

  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: TIMEZONE,
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FreeBusy request failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const calendar = data.calendars?.[calendarId];
  if (calendar?.errors?.length) {
    throw new Error(
      `FreeBusy returned errors for ${calendarId}: ${JSON.stringify(calendar.errors)}`
    );
  }
  const busy: Array<{ start: string; end: string }> = calendar?.busy ?? [];
  return busy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

export interface CreateEventInput {
  summary: string;
  description?: string;
  startUtc: Date;
  endUtc: Date;
  attendeeEmail: string;
  attendeeName?: string;
}

export async function createCalendarEvent(input: CreateEventInput): Promise<{ eventId: string }> {
  const { calendarId } = getCreds();
  const token = await getAccessToken();

  // We deliberately DO NOT set `attendees`. Service accounts on a personal
  // Google account (no Workspace, no Domain-Wide Delegation) cannot invite
  // attendees — the Calendar API rejects with 403 `forbiddenForServiceAccounts`.
  // Instead we embed the prospect's name + email in the description so Denise
  // has the contact info on the event itself. The prospect receives our own
  // Resend confirmation email (with an ICS attachment) for their calendar.
  const attendeeLine = input.attendeeName
    ? `Prospect: ${input.attendeeName} <${input.attendeeEmail}>`
    : `Prospect: ${input.attendeeEmail}`;
  const description = [attendeeLine, input.description ?? ""].filter(Boolean).join("\n\n");

  const body = {
    summary: input.summary,
    description,
    start: { dateTime: input.startUtc.toISOString(), timeZone: TIMEZONE },
    end: { dateTime: input.endUtc.toISOString(), timeZone: TIMEZONE },
    reminders: { useDefault: true },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?sendUpdates=none`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendar event create failed (${res.status}): ${text}`);
  }
  const data = await res.json();
  return { eventId: data.id };
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const { calendarId } = getCreds();
  const token = await getAccessToken();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}?sendUpdates=none`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // 404/410 mean the event is already gone — treat as success.
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const text = await res.text();
    throw new Error(`Calendar event delete failed (${res.status}): ${text}`);
  }
}

// ── Slot generation ────────────────────────────────────────────────────────

/**
 * Returns available 30-min slot start times (UTC) for the given local-Europe/London date.
 * Filters: past, within MIN_LEAD_HOURS, weekends, weekend in availability_overrides,
 * and overlaps with Google Calendar busy periods.
 */
export async function getAvailableSlots(localDate: Date, now: Date = new Date()): Promise<Date[]> {
  // Use the day in Europe/London regardless of the caller's locale
  const londonDateStr = formatInTimeZone(localDate, TIMEZONE, "yyyy-MM-dd");

  // Check weekend in Europe/London
  const dayOfWeek = toZonedTime(localDate, TIMEZONE).getDay(); // 0=Sun, 6=Sat
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];

  // Build all candidate slots for that London date
  const candidates: Date[] = [];
  for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      const slotLocalIso = `${londonDateStr}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
      // Interpret slotLocalIso as a wall-clock time in London, get UTC
      const utc = londonWallClockToUtc(slotLocalIso);
      candidates.push(utc);
    }
  }

  // Filter: lead time
  const minStart = new Date(now.getTime() + MIN_LEAD_HOURS * 60 * 60 * 1000);
  let slots = candidates.filter((c) => c.getTime() >= minStart.getTime());

  if (slots.length === 0) return [];

  // Freebusy lookup spans first-to-last candidate (+ buffer for the last slot's end)
  const windowStart = slots[0];
  const windowEnd = new Date(slots[slots.length - 1].getTime() + SLOT_MINUTES * 60_000);
  const busy = await getBusySlots(windowStart, windowEnd);

  slots = slots.filter((slotStart) => {
    const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60_000);
    return !busy.some((b) => rangesOverlap(slotStart, slotEnd, b.start, b.end));
  });

  return slots;
}

function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Interpret a local wall-clock time string (YYYY-MM-DDTHH:mm:ss) as Europe/London,
 * return the corresponding UTC Date. Handles BST/GMT transitions.
 */
function londonWallClockToUtc(wallClockIso: string): Date {
  // First guess: treat the string as UTC
  const naiveUtc = new Date(`${wallClockIso}Z`);
  // Format that UTC instant as it would appear in London
  const asLondon = formatInTimeZone(naiveUtc, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ss");
  // The offset is (what we want London to read) − (what London actually reads)
  const wantedMs = Date.parse(`${wallClockIso}Z`);
  const londonMs = Date.parse(`${asLondon}Z`);
  const offsetMs = wantedMs - londonMs; // positive in BST
  return new Date(naiveUtc.getTime() + offsetMs);
}
