// Supabase Edge Function: process-assessment-queue
// Runs every minute via pg_cron. Sends any due assessment emails through Resend.
//
// Auth: requires header `x-cron-secret` matching env CRON_SECRET.
// Required env vars (set via `supabase secrets set ...`):
//   - RESEND_API_KEY        (Resend API key for sagacitynetwork.net)
//   - CRON_SECRET           (matches Vault `assessment_cron_secret`)
//   - SUPABASE_URL          (auto-injected)
//   - SUPABASE_SERVICE_ROLE_KEY (auto-injected)

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const FROM = "Denise at Sagacity Network <denise@sagacitynetwork.net>";
const REPLY_TO = "denise@sagacitynetwork.net";
const BATCH_SIZE = 50;

// Map q1..q8 to friendly category names
const CATEGORY_NAMES: Record<string, string> = {
  q1: "web presence",
  q2: "lead follow-up",
  q3: "cybersecurity",
  q4: "automation",
  q5: "data and reporting",
  q6: "client experience",
  q7: "online reputation",
  q8: "AI readiness",
};

interface QueueRow {
  id: string;
  lead_id: string;
  email_number: number;
  band: string;
  attempts: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  business: string | null;
  score: number;
  band: string;
  q1: number; q2: number; q3: number; q4: number;
  q5: number; q6: number; q7: number; q8: number;
  utm_source: string | null;
}

interface Template {
  band: string;
  email_number: number;
  subject: string;
  preview: string;
  body: string;
}

function render(template: string, lead: Lead): string {
  const business = lead.business && lead.business.trim().length > 0 ? lead.business : "your business";
  const firstName = (lead.name || "").split(/\s+/)[0] || "there";

  // Compute the three weakest categories (lowest q1..q8)
  const scores = (["q1","q2","q3","q4","q5","q6","q7","q8"] as const).map((k) => ({
    key: k, score: (lead[k] ?? 0), name: CATEGORY_NAMES[k],
  }));
  scores.sort((a, b) => a.score - b.score);
  const weakest = scores.slice(0, 3).map((s) => s.name);

  const replacements: Record<string, string> = {
    "{{name}}": firstName,
    "{{first_name}}": firstName,
    "{{email}}": lead.email ?? "",
    "{{business}}": business,
    "{{score}}": String(lead.score ?? 0),
    "{{band}}": lead.band ?? "",
    "{{q1}}": String(lead.q1 ?? 0),
    "{{q2}}": String(lead.q2 ?? 0),
    "{{q3}}": String(lead.q3 ?? 0),
    "{{q4}}": String(lead.q4 ?? 0),
    "{{q5}}": String(lead.q5 ?? 0),
    "{{q6}}": String(lead.q6 ?? 0),
    "{{q7}}": String(lead.q7 ?? 0),
    "{{q8}}": String(lead.q8 ?? 0),
    "{{utm_source}}": lead.utm_source ?? "",
    "{{weakest_category}}": weakest[0] ?? "",
    "{{weakest_2}}": weakest[1] ?? "",
    "{{weakest_3}}": weakest[2] ?? "",
  };

  let out = template;
  for (const [k, v] of Object.entries(replacements)) {
    out = out.split(k).join(v);
  }
  return out;
}

function bodyToHtml(text: string): string {
  // Simple paragraph wrap. Convert URLs to anchors.
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const linkify = (s: string) =>
    s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>');
  const paragraphs = text.split(/\n\s*\n/);
  return paragraphs
    .map((p) => `<p style="margin:0 0 1em 0;line-height:1.55">${linkify(escapeHtml(p)).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

async function sendViaResend(opts: {
  apiKey: string;
  to: string;
  subject: string;
  preview: string;
  text: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      reply_to: REPLY_TO,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      headers: { "X-Entity-Ref-ID": crypto.randomUUID() },
      // Resend uses the first ~100 chars of the email as preview unless provided.
      // We embed preview text invisibly at the top of HTML.
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Resend ${res.status}: ${JSON.stringify(data)}`);
  }
  return data as { id?: string };
}

Deno.serve(async (req: Request) => {
  // Auth
  const expected = Deno.env.get("CRON_SECRET") ?? "";
  const got = req.headers.get("x-cron-secret") ?? "";
  if (!expected || got !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendKey = Deno.env.get("RESEND_API_KEY");

  if (!resendKey) {
    return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Pull due rows
  const { data: due, error: dueErr } = await supabase
    .from("email_queue")
    .select("id, lead_id, email_number, band, attempts")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .lt("attempts", 5)
    .order("scheduled_for", { ascending: true })
    .limit(BATCH_SIZE);

  if (dueErr) {
    return new Response(JSON.stringify({ error: dueErr.message }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const results: Array<{ id: string; status: string; error?: string; resend_id?: string }> = [];

  for (const row of (due ?? []) as QueueRow[]) {
    try {
      // Load lead + template in parallel
      const [{ data: lead, error: leadErr }, { data: tpl, error: tplErr }] = await Promise.all([
        supabase.from("leads").select("*").eq("id", row.lead_id).single(),
        supabase.from("email_templates").select("*").eq("band", row.band).eq("email_number", row.email_number).single(),
      ]);

      if (leadErr || !lead) throw new Error(`lead lookup failed: ${leadErr?.message ?? "not found"}`);
      if (tplErr || !tpl) throw new Error(`template lookup failed: ${tplErr?.message ?? "not found"}`);

      const L = lead as Lead;
      const T = tpl as Template;

      const subject = render(T.subject, L);
      const preview = render(T.preview, L);
      const text = render(T.body, L);
      const previewSpan = `<span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${preview}</span>`;
      const html = previewSpan + "\n" + bodyToHtml(text);

      const sent = await sendViaResend({
        apiKey: resendKey, to: L.email, subject, preview, text, html,
      });

      const { error: updErr } = await supabase
        .from("email_queue")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          resend_id: sent.id ?? null,
          attempts: row.attempts + 1,
          last_error: null,
        })
        .eq("id", row.id);

      if (updErr) console.error("queue update failed", row.id, updErr.message);
      results.push({ id: row.id, status: "sent", resend_id: sent.id });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const newAttempts = row.attempts + 1;
      const finalStatus = newAttempts >= 5 ? "failed" : "pending";
      await supabase
        .from("email_queue")
        .update({ attempts: newAttempts, last_error: message, status: finalStatus })
        .eq("id", row.id);
      results.push({ id: row.id, status: "error", error: message });
    }
  }

  return new Response(JSON.stringify({
    processed: results.length,
    results,
  }), { headers: { "Content-Type": "application/json" } });
});
