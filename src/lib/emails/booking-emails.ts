/**
 * Resend email templates for the booking system.
 *
 * All emails are sent from "Denise at Sagacity Network <denise@sagacitynetwork.net>"
 * with reply-to denise@sagacitynetwork.net. The Resend domain sagacitynetwork.net
 * is already verified.
 *
 * Server-only.
 */

import "server-only";
import { Resend } from "resend";
import { formatInTimeZone } from "date-fns-tz";

const TIMEZONE = "Europe/London";
const FROM = "Denise at Sagacity Network <denise@sagacitynetwork.net>";
const REPLY_TO = "denise@sagacitynetwork.net";

// Lazy so missing RESEND_API_KEY only fails at send time, not at import time.
let _resend: Resend | null = null;
function resend(): Resend {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _resend = new Resend(key);
  return _resend;
}

// ── Types ──────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  name: string;
  email: string;
  business?: string | null;
  message?: string | null;
  slot_start: string; // ISO UTC
  slot_end: string;
  meeting_link: string;
  cancel_token: string;
}

export interface Lead {
  score?: number | null;
  band?: string | null;
  q1?: number | null;
  q2?: number | null;
  q3?: number | null;
  q4?: number | null;
  q5?: number | null;
  q6?: number | null;
  q7?: number | null;
  q8?: number | null;
}

// ── Formatting helpers ─────────────────────────────────────────────────────

const formatDayDate = (d: Date) =>
  formatInTimeZone(d, TIMEZONE, "EEEE d MMMM yyyy"); // e.g. "Thursday 16 April 2026"

const formatTime = (d: Date) =>
  formatInTimeZone(d, TIMEZONE, "h:mm a"); // e.g. "9:30 AM"

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsDate(d: Date): string {
  // YYYYMMDDTHHMMSSZ
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Build a minimal VCALENDAR (.ics) file for the booking. Prospect can open
 * it in Apple Calendar / Outlook / Google to add the event.
 */
function buildIcs(booking: Booking): string {
  const start = new Date(booking.slot_start);
  const end = new Date(booking.slot_end);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sagacity Network//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@sagacitynetwork.net`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${icsEscape("Digital Clarity Call — Sagacity Network")}`,
    `DESCRIPTION:${icsEscape(`Your 30-minute call with Denise.\n\nJoin: ${booking.meeting_link}`)}`,
    `LOCATION:${icsEscape(booking.meeting_link)}`,
    `URL:${booking.meeting_link}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

// Category labels for the 8 assessment questions (order matches q1..q8)
const CATEGORIES = [
  "Web presence",
  "Lead follow-up",
  "Cybersecurity",
  "Automation",
  "Business intelligence",
  "Digital marketing",
  "Customer experience",
  "Team enablement",
];

function formatLeadScores(lead: Lead): string {
  const lines: string[] = [];
  for (let i = 0; i < 8; i++) {
    const key = `q${i + 1}` as keyof Lead;
    const value = lead[key];
    if (typeof value === "number") {
      lines.push(`  ${CATEGORIES[i].padEnd(22)}: ${value}/6`);
    }
  }
  return lines.join("\n");
}

// ── 1. Confirmation to prospect ────────────────────────────────────────────

export async function sendBookingConfirmationToProspect(
  booking: Booking,
  lead?: Lead | null
): Promise<void> {
  const start = new Date(booking.slot_start);
  const dayDate = formatDayDate(start);
  const time = formatTime(start);

  const scoreLine = lead?.score
    ? `\nBased on your assessment score of ${lead.score}/100, I already have a sense of where we'll focus — I'll come prepared.\n`
    : "";

  const text = [
    `Hi ${booking.name},`,
    "",
    "Your 30-minute Digital Clarity Call is booked.",
    "",
    `Date: ${dayDate}`,
    `Time: ${time} UK time`,
    `Duration: 30 minutes`,
    `Join here: ${booking.meeting_link}`,
    "",
    "Here's what to expect on the call. You'll do most of the talking — I want to understand your business and where you are right now. We'll look at what you're doing well and what I'd prioritise if it were my business. No pitch, no pressure. Just a clear picture.",
    scoreLine,
    "If you need to reschedule or cancel, reply to this email and I'll sort it.",
    "",
    "Looking forward to speaking with you.",
    "",
    "Denise",
    "Sagacity Network",
    "https://sagacitynetwork.net",
  ].filter(Boolean).join("\n");

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6">
<p>Hi ${escapeHtml(booking.name)},</p>
<p>Your 30-minute Digital Clarity Call is booked.</p>
<table style="margin:24px 0;border-collapse:collapse"><tbody>
<tr><td style="padding:6px 16px 6px 0;color:#666">Date</td><td style="padding:6px 0;font-weight:500">${dayDate}</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Time</td><td style="padding:6px 0;font-weight:500">${time} UK time</td></tr>
<tr><td style="padding:6px 16px 6px 0;color:#666">Duration</td><td style="padding:6px 0;font-weight:500">30 minutes</td></tr>
</tbody></table>
<p><a href="${booking.meeting_link}" style="display:inline-block;background:linear-gradient(135deg,#5B2D8E,#7B3FA0);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">Join the call</a></p>
<p style="margin-top:32px">Here's what to expect. You'll do most of the talking — I want to understand your business and where you are right now. We'll look at what you're doing well and what I'd prioritise if it were my business. No pitch, no pressure. Just a clear picture.</p>
${scoreLine ? `<p>${escapeHtml(scoreLine.trim())}</p>` : ""}
<p>If you need to reschedule or cancel, reply to this email and I'll sort it.</p>
<p style="margin-top:32px">Looking forward to speaking with you.</p>
<p style="margin-top:24px">Denise<br><span style="color:#666">Sagacity Network</span><br><a href="https://sagacitynetwork.net" style="color:#7B3FA0">sagacitynetwork.net</a></p>
</body></html>`;

  await resend().emails.send({
    from: FROM,
    to: booking.email,
    replyTo: REPLY_TO,
    subject: `Your Digital Clarity Call is confirmed — ${dayDate}, ${time}`,
    text,
    html,
    attachments: [
      {
        filename: "sagacity-call.ics",
        content: Buffer.from(buildIcs(booking)).toString("base64"),
      },
    ],
  });
}

// ── 2. Notification to Denise ──────────────────────────────────────────────

export async function sendBookingNotificationToDenise(
  booking: Booking,
  lead?: Lead | null
): Promise<void> {
  const start = new Date(booking.slot_start);
  const dayDate = formatDayDate(start);
  const time = formatTime(start);
  const to = process.env.BOOKING_NOTIFICATION_EMAIL ?? REPLY_TO;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sagacitynetwork.net";
  const cancelUrl = `${siteUrl}/api/booking/cancel?id=${booking.id}&token=${booking.cancel_token}`;

  const leadBlock = lead
    ? [
        "",
        "── Assessment context ──",
        `Score: ${lead.score ?? "—"}/100   Band: ${lead.band ?? "—"}`,
        "",
        formatLeadScores(lead),
      ].join("\n")
    : "\n(No assessment on file — prospect booked cold.)";

  const text = [
    `New booking: ${booking.name} — ${dayDate}, ${time}`,
    "",
    `Name:     ${booking.name}`,
    `Email:    ${booking.email}`,
    `Business: ${booking.business || "—"}`,
    "",
    `Slot:     ${dayDate}, ${time} (UK)`,
    `Join:     ${booking.meeting_link}`,
    "",
    booking.message ? `Their message:\n  "${booking.message}"` : "(No message)",
    leadBlock,
    "",
    `── Actions ──`,
    `Cancel: ${cancelUrl}`,
  ].join("\n");

  await resend().emails.send({
    from: FROM,
    to,
    replyTo: booking.email,
    subject: `New booking: ${booking.name} — ${dayDate}, ${time}`,
    text,
  });
}

// ── 3. Cancellation email to prospect ──────────────────────────────────────

export async function sendCancellationEmail(booking: Booking): Promise<void> {
  const start = new Date(booking.slot_start);
  const dayDate = formatDayDate(start);
  const time = formatTime(start);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sagacitynetwork.net";

  const text = [
    `Hi ${booking.name},`,
    "",
    `Just confirming that your Digital Clarity Call on ${dayDate} at ${time} UK time has been cancelled.`,
    "",
    `If this wasn't intentional, or you'd like to rebook for another time, you can pick a new slot here:`,
    `${siteUrl}/book`,
    "",
    "No worries either way — just reply to this email if you need anything.",
    "",
    "Denise",
    "Sagacity Network",
  ].join("\n");

  await resend().emails.send({
    from: FROM,
    to: booking.email,
    replyTo: REPLY_TO,
    subject: `Your call has been cancelled — ${dayDate}`,
    text,
  });
}

// ── 4. 24-hour reminder ────────────────────────────────────────────────────

export async function sendReminder24h(booking: Booking): Promise<void> {
  const start = new Date(booking.slot_start);
  const time = formatTime(start);

  const text = [
    `Hi ${booking.name},`,
    "",
    `Quick reminder — our Digital Clarity Call is tomorrow at ${time} UK time.`,
    "",
    `Join here: ${booking.meeting_link}`,
    "",
    "See you then.",
    "",
    "Denise",
  ].join("\n");

  await resend().emails.send({
    from: FROM,
    to: booking.email,
    replyTo: REPLY_TO,
    subject: `Your Digital Clarity Call is tomorrow — ${time} UK`,
    text,
    attachments: [
      {
        filename: "sagacity-call.ics",
        content: Buffer.from(buildIcs(booking)).toString("base64"),
      },
    ],
  });
}

// ── 5. 1-hour reminder ─────────────────────────────────────────────────────

export async function sendReminder1h(booking: Booking): Promise<void> {
  const text = [
    `Hi ${booking.name},`,
    "",
    "We're on in 1 hour.",
    "",
    `Join here: ${booking.meeting_link}`,
    "",
    "Denise",
  ].join("\n");

  await resend().emails.send({
    from: FROM,
    to: booking.email,
    replyTo: REPLY_TO,
    subject: `Your call with Denise is in 1 hour — join link inside`,
    text,
  });
}

// ── Utilities ──────────────────────────────────────────────────────────────

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
