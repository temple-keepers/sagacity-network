# Sagacity Network -- Email Campaign Setup Guide

This guide walks through the complete setup: Resend for sending emails, Supabase for the webhook trigger, and n8n for the automation workflow. No code required -- just configuration steps.

---

## Section 1: Resend setup

### Create your account

1. Go to resend.com and create an account.
2. Once logged in, go to **Domains** in the left sidebar.
3. Click **Add Domain** and enter `sagacitynetwork.net`.
4. Resend will give you DNS records to add (SPF, DKIM, and optionally DMARC). Add these to your domain's DNS settings. Verification usually takes a few minutes but can take up to 48 hours.
5. Once the domain shows as **Verified**, you are ready to send.

### Create audiences

You need 4 audiences to segment your leads by band.

1. Go to **Audiences** in the left sidebar.
2. Create 4 audiences with these exact names:
   - At Risk
   - Early Stage
   - Developing
   - Advanced

### Create email templates

You need 20 templates total: 5 emails for each of the 4 bands.

1. Go to **Emails** in the left sidebar, then **Templates**.
2. Create a template for each email. Use a clear naming convention, for example: `at-risk-email-1`, `at-risk-email-2`, `early-stage-email-1`, and so on.
3. Copy the subject line and body content from the corresponding `.md` file in this folder (e.g., `at-risk/email-1-score-delivery.md`).
4. Use these template variables in the content where needed: `{{name}}`, `{{score}}`, `{{band}}`.
5. Note down the **template ID** for each template. You will need these when configuring n8n.

### Sender settings

For every template, use these sender details:

- **From:** `Denise at Sagacity Network <denise@sagacitynetwork.net>`
- **Reply-to:** `denise@sagacitynetwork.net`

---

## Section 2: Supabase webhook setup

This webhook fires every time a new lead is inserted into your database, sending the lead data to n8n.

### Create the webhook

1. In the Supabase dashboard, go to **Database** in the left sidebar, then **Webhooks**.
2. Click **Create a new webhook**.
3. Give it a name like `new-lead-to-n8n`.
4. Set the table to `leads`.
5. Set the event to **INSERT** only.
6. For the URL, enter your n8n webhook URL. It will look something like: `YOUR_N8N_OR_MAKE_WEBHOOK_URL`. You will get this URL from n8n after creating the webhook trigger node (see Section 3).
7. Set the HTTP method to **POST**.

### Webhook payload

The webhook will send the full row from the `leads` table. The payload includes:

- `id` -- unique identifier
- `name` -- full name
- `email` -- email address
- `business` -- business name
- `score` -- numerical score (0-100)
- `band` -- one of: Digitally At Risk, Early Stage, Developing, Advanced
- `q1` through `q8` -- individual category scores
- `utm_source` -- traffic source
- `email_sequence_started` -- boolean flag
- `created_at` -- timestamp

### Test the webhook

1. Go to the **SQL Editor** in Supabase.
2. Run a test insert:

```
INSERT INTO public.leads (name, email, business, score, band, q1,q2,q3,q4,q5,q6,q7,q8, utm_source)
VALUES ('Test User', 'denise+test@sagacitynetwork.net', 'Test Co', 35, 'Early Stage', 4,2,3,2,2,4,3,2, 'test');
```

3. Check your n8n webhook trigger to confirm it received the payload.
4. Delete the test row when done:

```
DELETE FROM leads WHERE utm_source = 'test';
```

---

## Section 3: n8n automation workflow

This is the core of the campaign. n8n receives the webhook, routes the lead to the right band, and sends 5 emails over 7 days.

### Step 1: Create the webhook trigger node

1. In n8n, create a new workflow.
2. Add a **Webhook** node as the trigger.
3. Set the HTTP method to **POST**.
4. Copy the webhook URL that n8n generates and paste it into your Supabase webhook configuration (from Section 2).
5. This node will receive the full lead payload every time someone completes the assessment.

### Step 2: Add a Switch node to route by band

1. After the webhook node, add a **Switch** node.
2. Set it to route based on the `band` field from the webhook payload.
3. Create 4 outputs:
   - Output 1: band equals `Digitally At Risk`
   - Output 2: band equals `Early Stage`
   - Output 3: band equals `Developing`
   - Output 4: band equals `Advanced`

### Step 3: Build the email sequence for each branch

Each of the 4 branches follows the same pattern. Repeat this for all 4:

1. **Send Email 1** -- Add a Resend node immediately after the Switch output. This sends the score delivery email right away.
2. **Wait 24 hours** -- Add a Wait node set to 24 hours.
3. **Send Email 2** -- Add a Resend node for the biggest gap email.
4. **Wait 48 hours** -- Add a Wait node set to 48 hours (this lands on day 3).
5. **Send Email 3** -- Add a Resend node for the real example email.
6. **Wait 48 hours** -- Add a Wait node set to 48 hours (this lands on day 5).
7. **Send Email 4** -- Add a Resend node for the cost of waiting email.
8. **Wait 48 hours** -- Add a Wait node set to 48 hours (this lands on day 7).
9. **Send Email 5** -- Add a Resend node for the book the call email.

### Step 4: Update Supabase after the sequence

After Email 5 in each branch, add a **Supabase** node (or HTTP Request node) to update the lead record:

- Set `email_sequence_started` to `true` for the lead's row in the `leads` table.
- Match on the lead's `id` from the original webhook payload.

### Configuring the Resend API nodes

Before configuring the individual nodes, add your Resend API credentials to n8n:

1. Go to **Settings** (gear icon) then **Credentials**.
2. Click **Add Credential** and search for Resend (or use a generic HTTP Header Auth).
3. Your Resend API key is found at resend.com/api-keys. It starts with `re_`.
4. Save the credential.

For each Resend node in the workflow, configure:

- **From:** `Denise at Sagacity Network <denise@sagacitynetwork.net>`
- **To:** use the `email` field from the webhook payload
- **Subject:** use the subject from the corresponding email template, with variables replaced
- **Template ID:** the Resend template ID for that specific email
- **Template variables:** pass `name`, `score`, and `band` from the webhook payload

### Alternative: Make.com

If you prefer Make.com over n8n, the logic is identical:

1. Use a **Webhook** module as the trigger.
2. Use a **Router** module to split by band (4 branches).
3. Use **HTTP** modules to call the Resend API for each email.
4. Use **Sleep** modules for the delays between emails.
5. Use an **HTTP** module to update Supabase at the end.

The Resend API endpoint for sending is `POST https://api.resend.com/emails` with your API key in the `Authorization: Bearer re_...` header.

---

## Section 4: Testing checklist

Work through these in order. Do not move on until each step passes.

1. Insert a test row in Supabase using the SQL Editor (use `utm_source = 'test'` so you can easily clean up).
2. Confirm the webhook fires by checking the n8n webhook trigger node for the received payload.
3. Confirm Email 1 arrives in your inbox within 30 seconds of the test insert.
4. Confirm the sender shows as "Denise at Sagacity Network" (not a generic address).
5. Confirm `{{name}}` renders correctly in the email (shows the actual name, not the placeholder text).
6. Confirm `{{score}}` and `{{band}}` render correctly in the email.
7. Manually trigger Email 2 in n8n (skip the wait node) to verify it sends correctly without waiting 24 hours.
8. Confirm `email_sequence_started` is set to `true` in the Supabase `leads` table after the sequence completes.
9. Insert the same test email address again and confirm it does not re-trigger the sequence (no duplicate sends).
10. Test all 4 bands by inserting one test lead per band (scores of 15, 38, 62, and 85) and confirming each receives the correct Email 1 for their band.

After testing, clean up:

```
DELETE FROM leads WHERE utm_source = 'test';
```
