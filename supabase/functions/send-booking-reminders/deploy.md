# Deploying `send-booking-reminders`

This Supabase Edge Function sends 24-hour and 1-hour reminder emails for
confirmed bookings. It is designed to run every 15 minutes via pg_cron.

## Prerequisites

- Supabase CLI installed: `npm i -g supabase`
- Logged in: `supabase login`
- Project linked: `supabase link --project-ref gnndbcmwjgoxofabukrp`

## 1. Set secrets

The function needs the same `RESEND_API_KEY` and `CRON_SECRET` already used by
`process-assessment-queue`. If that function is already deployed, these are
already set — skip this step.

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set CRON_SECRET=your-long-random-string
```

## 2. Deploy the function

```bash
supabase functions deploy send-booking-reminders --no-verify-jwt
```

`--no-verify-jwt` is safe because the function requires `x-cron-secret` for
authentication.

## 3. Schedule it with pg_cron

Run this SQL once in the Supabase SQL editor. Replace the placeholders with
your actual project ref and a **Vault secret** for the cron token (do NOT
hardcode it).

First, store the cron secret in Vault if you haven't already:

```sql
-- Run once (idempotent). The secret name is re-used by any other cron jobs.
select vault.create_secret(
  'your-long-random-string',          -- same value as CRON_SECRET above
  'booking_cron_secret',
  'Shared secret for booking reminder cron'
);
```

Then schedule the job:

```sql
select cron.schedule(
  'send-booking-reminders',
  '*/15 * * * *',  -- every 15 minutes
  $$
    select
      net.http_post(
        url := 'https://gnndbcmwjgoxofabukrp.supabase.co/functions/v1/send-booking-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'booking_cron_secret')
        ),
        body := '{}'::jsonb
      ) as request_id;
  $$
);
```

## 4. Verify

- Check scheduled job:
  ```sql
  select * from cron.job where jobname = 'send-booking-reminders';
  ```
- Check recent runs:
  ```sql
  select * from cron.job_run_details where jobname = 'send-booking-reminders' order by start_time desc limit 10;
  ```
- Tail function logs:
  ```bash
  supabase functions logs send-booking-reminders --tail
  ```

## How it works

Every 15 minutes, the function:

1. Queries `bookings` for rows where `status='confirmed'` AND
   `reminder_24h_sent=false` AND `slot_start` is within ±15 min of `now + 24h`.
2. Sends the 24h reminder via Resend (with an ICS attachment), flips the flag.
3. Same for `reminder_1h_sent` against `now + 1h` (no ICS attachment — they
   already have it from earlier emails).

The flag-first approach is idempotent: if the function re-runs on a backfill,
already-sent reminders are skipped.

## Rolling back

- Unschedule: `select cron.unschedule('send-booking-reminders');`
- Delete function: `supabase functions delete send-booking-reminders`
