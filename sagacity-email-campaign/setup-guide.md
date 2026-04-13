# Sagacity Network — Post-Assessment Email Campaign: Setup Guide

This is the live setup. Everything is wired through Supabase + Resend. No Make, no n8n.

## How it works

1. Someone completes the Digital Readiness Assessment.
2. Your assessment app inserts a row into the Supabase `leads` table.
3. A database trigger creates 5 rows in the `email_queue` table — one per email — scheduled for now, +24h, +72h, +120h, +168h.
4. A pg_cron job runs every minute. It calls a Supabase Edge Function (`process-assessment-queue`) which finds any due rows, renders the right template for the lead's band, and sends the email through Resend.
5. The queue row is marked `sent` (with the Resend message ID) or `failed` (with the error). Failed rows retry up to 5 times.

That's the whole system. Four moving parts: `leads` table, `email_queue` table, `email_templates` table, one Edge Function.

## Database objects

All in the `public` schema of project `gnndbcmwjgoxofabukrp`.

- `leads` — your existing table. New columns `email_sequence_started boolean` and `utm_source text` were added.
- `email_templates` — 20 rows (4 bands × 5 emails). Subject, preview, body. Idempotent seed lives at `seed_email_templates.sql` if you ever need to re-run it.
- `email_queue` — one row per scheduled send. `status` is `pending`, `sent`, `failed`, or `skipped`. Retries up to 5 times before marking failed.
- `enqueue_assessment_sequence()` trigger function — fires `AFTER INSERT ON leads`. Skips leads where `email_sequence_started=true` or `band` is unknown.
- `cron.job` `process-assessment-queue` — runs every minute, calls the Edge Function via `net.http_post`, passes the `x-cron-secret` header from Vault.

## Edge Function

`process-assessment-queue` is deployed and active. It is JWT-disabled and authenticated via the `x-cron-secret` header.

It needs three secrets set in the Supabase Dashboard (Project Settings → Edge Functions → Manage secrets):

| Secret | Value |
|--------|-------|
| `RESEND_API_KEY` | Your Resend API key (`re_...`). Get it from resend.com/api-keys. |
| `CRON_SECRET` | The shared secret stored in Supabase Vault under `assessment_cron_secret`. |
| `SUPABASE_URL` | Auto-injected — do not set manually. |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-injected — do not set manually. |

To pull the `CRON_SECRET` value, run this in the SQL Editor:

```sql
SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'assessment_cron_secret';
```

Copy the value and paste it as the `CRON_SECRET` Edge Function secret. They must match — that's how the cron job authenticates to the function.

## Sender configuration

All emails are sent from `Denise at Sagacity Network <denise@sagacitynetwork.net>` with reply-to `denise@sagacitynetwork.net`. Domain `sagacitynetwork.net` is verified in Resend (eu-west-1).

## Required `leads` table shape

The trigger expects these columns to exist:

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | First word is used as `{{name}}` |
| `email` | text | Recipient |
| `business` | text | Optional. Defaults to "your business" if empty |
| `score` | int | 0–100 |
| `band` | text | Must be one of: `Digitally At Risk`, `Early Stage`, `Developing`, `Advanced` |
| `q1`–`q8` | int | Individual category scores |
| `utm_source` | text | Optional |
| `email_sequence_started` | bool | Defaults to `false`. Set to `true` after enqueue |
| `created_at` | timestamptz | Defaults to `now()` |

If the `band` value doesn't match exactly (case- and space-sensitive), no emails will be queued.

## Template variables

These are substituted in subject, preview, and body:

`{{name}}` `{{first_name}}` `{{email}}` `{{business}}` `{{score}}` `{{band}}` `{{q1}}`–`{{q8}}` `{{utm_source}}` `{{weakest_category}}` `{{weakest_2}}` `{{weakest_3}}`

The "weakest" variables are computed from the three lowest q-scores using these category names: q1=web presence, q2=lead follow-up, q3=cybersecurity, q4=automation, q5=data and reporting, q6=client experience, q7=online reputation, q8=AI readiness.

## Testing

After setting the two Edge Function secrets, insert one dummy lead per band:

```sql
INSERT INTO public.leads (name, email, business, score, band, q1,q2,q3,q4,q5,q6,q7,q8, utm_source) VALUES
('Test AtRisk',  'denise+atrisk@sagacitynetwork.net',  'Test Co', 15, 'Digitally At Risk', 0,2,0,0,2,0,2,0, 'test'),
('Test Early',   'denise+early@sagacitynetwork.net',   'Test Co', 38, 'Early Stage',       4,2,3,2,2,4,3,2, 'test'),
('Test Develop', 'denise+dev@sagacitynetwork.net',     'Test Co', 62, 'Developing',        6,4,4,3,3,6,4,2, 'test'),
('Test Advance', 'denise+adv@sagacitynetwork.net',     'Test Co', 85, 'Advanced',          6,6,6,4,4,6,6,3, 'test');
```

Within 60 seconds, four "Email 1" messages should land in your inbox (Resend delivers nearly instantly, the cron tick is the only delay).

To verify queue state:

```sql
SELECT l.name, q.email_number, q.status, q.scheduled_for, q.sent_at, q.last_error
FROM email_queue q JOIN leads l ON l.id = q.lead_id
WHERE l.utm_source = 'test'
ORDER BY l.created_at, q.email_number;
```

To clean up after testing:

```sql
DELETE FROM leads WHERE utm_source = 'test';   -- cascade deletes the queue rows
```

To accelerate the full sequence for testing (so you don't wait 7 days), temporarily move all your test queue rows into the past:

```sql
UPDATE email_queue SET scheduled_for = now()
WHERE lead_id IN (SELECT id FROM leads WHERE utm_source = 'test') AND status = 'pending';
```

The next cron tick will fire all of them.

## Operations

**Manually trigger a tick** (useful for debugging, one-off sends):

```sql
SELECT net.http_post(
  url := 'https://gnndbcmwjgoxofabukrp.supabase.co/functions/v1/process-assessment-queue',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'assessment_cron_secret')
  ),
  body := '{}'::jsonb
);
```

**Pause the entire sequence** for everyone:

```sql
SELECT cron.unschedule('process-assessment-queue');
```

**Resume:**

```sql
SELECT cron.schedule('process-assessment-queue', '* * * * *', $cron$
  SELECT net.http_post(
    url := 'https://gnndbcmwjgoxofabukrp.supabase.co/functions/v1/process-assessment-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'assessment_cron_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$cron$);
```

**Stop one specific lead's sequence** (e.g. they unsubscribed, or replied):

```sql
UPDATE email_queue SET status = 'skipped'
WHERE lead_id = '<lead_id>' AND status = 'pending';
```

**Edit an email** — just update the row in `email_templates`. The next send picks up the change automatically:

```sql
UPDATE email_templates SET body = $body$...new content...$body$
WHERE band = 'Early Stage' AND email_number = 3;
```

**Inspect failures:**

```sql
SELECT l.email, q.email_number, q.attempts, q.last_error
FROM email_queue q JOIN leads l ON l.id = q.lead_id
WHERE q.status IN ('failed','pending') AND q.attempts > 0
ORDER BY q.scheduled_for DESC LIMIT 50;
```

**Edge Function logs:** Supabase Dashboard → Edge Functions → process-assessment-queue → Logs. Or use the `get_logs` MCP tool with `service: "edge-function"`.

## Deliverability

Domain `sagacitynetwork.net` should already be passing SPF, DKIM, and DMARC in Resend. If emails land in spam:

1. Check resend.com/domains for any failed records.
2. Avoid sending many test emails to the same address in a short window.
3. Send a second test to a different inbox (Outlook, Yahoo) to confirm cross-provider delivery.

## What to do if you change the email content

The `.md` files in `at-risk/`, `early-stage/`, `developing/`, `advanced/` are the source of truth. After editing them, regenerate `seed_email_templates.sql` and re-run it against Supabase — the `ON CONFLICT DO UPDATE` clause makes it idempotent.

Or just edit `email_templates` directly with SQL if it's a one-line change.
