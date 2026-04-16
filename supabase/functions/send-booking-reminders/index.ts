// Supabase Edge Function: send-booking-reminders
// Runs every 15 min via pg_cron. Sends 24h and 1h reminders for confirmed bookings.
//
// Auth: requires header `x-cron-secret` matching env CRON_SECRET (same secret used
// by process-assessment-queue).
//
// Required env vars (set via `supabase secrets set ...`):
//   - RESEND_API_KEY
//   - CRON_SECRET
//   - SUPABASE_URL              (auto-injected)
//   - SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const FROM = "Denise at Sagacity Network <denise@sagacitynetwork.net>";
const REPLY_TO = "denise@sagacitynetwork.net";
const TIMEZONE = "Europe/London";

// Window half-width around each reminder boundary (ms). pg_cron fires every 15min,
// so we look for rows whose boundary falls inside ±15min of `now + offset`.
const WINDOW_MS = 15 * 60 * 1000;
const H24 = 24 * 60 * 60 * 1000;
const H1 = 60 * 60 * 1000;

interface BookingRow {
  id: string;
  name: string;
  email: string;
  slot_start: string;
  slot_end: string;
  meeting_link: string | null;
  reminder_24h_sent: boolean | null;
  reminder_1h_sent: boolean | null;
}

function formatTimeLondon(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: TIMEZONE,
  }).format(new Date(iso));
}

function icsEscape(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toIcsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function buildIcs(b: BookingRow): string {
  const start = new Date(b.slot_start);
  const end = new Date(b.slot_end);
  const link = b.meeting_link ?? "";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Sagacity Network//Booking//EN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${b.id}@sagacitynetwork.net`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${icsEscape("Digital Clarity Call — Sagacity Network")}`,
    `DESCRIPTION:${icsEscape(`Your 30-minute call with Denise.\n\nJoin: ${link}`)}`,
    `LOCATION:${icsEscape(link)}`,
    `URL:${link}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function build24hEmail(b: BookingRow): { subject: string; text: string; html: string } {
  const time = formatTimeLondon(b.slot_start);
  const link = b.meeting_link ?? "";
  const text = [
    `Hi ${b.name},`,
    "",
    `Quick reminder — our Digital Clarity Call is tomorrow at ${time} UK time.`,
    "",
    `Join here: ${link}`,
    "",
    "See you then.",
    "",
    "Denise",
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6">
<p>Hi ${b.name},</p>
<p>Quick reminder — our Digital Clarity Call is <strong>tomorrow at ${time} UK time</strong>.</p>
<p><a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#5B2D8E,#7B3FA0);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">Join the call</a></p>
<p style="margin-top:32px">See you then.</p>
<p>Denise</p>
</body></html>`;
  return {
    subject: `Your Digital Clarity Call is tomorrow — ${time} UK`,
    text,
    html,
  };
}

function build1hEmail(b: BookingRow): { subject: string; text: string; html: string } {
  const link = b.meeting_link ?? "";
  const text = [
    `Hi ${b.name},`,
    "",
    "We're on in 1 hour.",
    "",
    `Join here: ${link}`,
    "",
    "Denise",
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1a1a1a;line-height:1.6">
<p>Hi ${b.name},</p>
<p>We&rsquo;re on in 1 hour.</p>
<p><a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#5B2D8E,#7B3FA0);color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:500">Join the call</a></p>
<p style="margin-top:32px">Denise</p>
</body></html>`;
  return {
    subject: `Your call with Denise is in 1 hour — join link inside`,
    text,
    html,
  };
}

async function sendViaResend(opts: {
  apiKey: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachIcs?: { filename: string; content: string };
}): Promise<{ id?: string }> {
  const body: Record<string, unknown> = {
    from: FROM,
    to: [opts.to],
    reply_to: REPLY_TO,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
  };
  if (opts.attachIcs) {
    body.attachments = [
      { filename: opts.attachIcs.filename, content: opts.attachIcs.content },
    ];
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  }
  return data as { id?: string };
}

async function processWindow(opts: {
  supabase: ReturnType<typeof createClient>;
  resendKey: string;
  offsetMs: number;
  flagColumn: "reminder_24h_sent" | "reminder_1h_sent";
  buildEmail: (b: BookingRow) => { subject: string; text: string; html: string };
  attachIcs: boolean;
}): Promise<Array<{ id: string; status: string; error?: string }>> {
  const now = Date.now();
  const windowStart = new Date(now + opts.offsetMs - WINDOW_MS).toISOString();
  const windowEnd = new Date(now + opts.offsetMs + WINDOW_MS).toISOString();

  const { data, error } = await opts.supabase
    .from("bookings")
    .select("id, name, email, slot_start, slot_end, meeting_link, reminder_24h_sent, reminder_1h_sent")
    .eq("status", "confirmed")
    .eq(opts.flagColumn, false)
    .gte("slot_start", windowStart)
    .lte("slot_start", windowEnd);

  if (error) throw new Error(error.message);

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const b of (data ?? []) as BookingRow[]) {
    try {
      const email = opts.buildEmail(b);
      const attachment = opts.attachIcs
        ? { filename: "sagacity-call.ics", content: btoa(buildIcs(b)) }
        : undefined;

      await sendViaResend({
        apiKey: opts.resendKey,
        to: b.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
        attachIcs: attachment,
      });

      // Flip the flag so we don't resend
      const { error: updErr } = await opts.supabase
        .from("bookings")
        .update({ [opts.flagColumn]: true })
        .eq("id", b.id);
      if (updErr) console.error("flag update failed", b.id, updErr.message);

      results.push({ id: b.id, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[send-booking-reminders] ${opts.flagColumn} failed for ${b.id}:`, message);
      results.push({ id: b.id, status: "error", error: message });
    }
  }

  return results;
}

Deno.serve(async (req: Request) => {
  const expected = Deno.env.get("CRON_SECRET") ?? "";
  const got = req.headers.get("x-cron-secret") ?? "";
  if (!expected || got !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const [r24, r1] = await Promise.all([
      processWindow({
        supabase,
        resendKey,
        offsetMs: H24,
        flagColumn: "reminder_24h_sent",
        buildEmail: build24hEmail,
        attachIcs: true,
      }),
      processWindow({
        supabase,
        resendKey,
        offsetMs: H1,
        flagColumn: "reminder_1h_sent",
        buildEmail: build1hEmail,
        attachIcs: false,
      }),
    ]);

    return new Response(
      JSON.stringify({
        processed: r24.length + r1.length,
        reminder_24h: r24,
        reminder_1h: r1,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
