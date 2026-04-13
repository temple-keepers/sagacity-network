# Sagacity Network -- Digital Readiness Assessment Email Campaign

## What this is

A 20-email automated welcome sequence triggered when someone completes the Sagacity Network Digital Readiness Assessment. Each person is scored 0-100 and placed into one of 4 bands. Each band has its own tailored 5-email sequence. That is 4 bands x 5 emails = 20 emails total.

The campaign runs on Supabase (database), Resend (email delivery), and n8n (automation).

## The 4 bands

| Band                  | Score range | Who they are                                                      |
|-----------------------|-------------|-------------------------------------------------------------------|
| Digitally At Risk     | 0-25        | Little or no web presence, no systems, heavy manual admin          |
| Early Stage           | 26-50       | Some basics in place but inconsistent, losing enquiries            |
| Developing            | 51-74       | Solid foundations, website works, some automation, ready to act    |
| Advanced              | 75-100      | Strong across the board, looking to compound with AI and systems   |

## The 5-email sequence

Every band follows the same structure. Only the content differs.

| Email   | Timing               | What it does                                                  |
|---------|----------------------|---------------------------------------------------------------|
| Email 1 | Immediately          | Deliver the score, explain what it means, set expectations    |
| Email 2 | 24 hours later       | Deep dive on their single biggest gap                         |
| Email 3 | 3 days after signup  | A real example of what fixing that gap looks like              |
| Email 4 | 5 days after signup  | The cost of leaving it unfixed -- specific numbers             |
| Email 5 | 7 days after signup  | Book the free Digital Clarity Call                             |

## Template variables

These are pulled from the Supabase `leads` table and injected into each email at send time:

| Variable       | Content                |
|----------------|------------------------|
| `{{name}}`     | First name             |
| `{{score}}`    | Numerical score 0-100  |
| `{{band}}`     | Band name              |
| `{{business}}` | Business name          |

## Folder structure

```
sagacity-email-campaign/
  README.md                        -- This file
  setup-guide.md                   -- Full implementation guide (Resend, Supabase, n8n)
  privacy-policy.md                -- UK GDPR compliant privacy policy
  seed_email_templates.sql         -- SQL seed for email templates
  edge-function/                   -- Supabase Edge Function source

  at-risk/                         -- Digitally At Risk (0-25)
    email-1-score-delivery.md
    email-2-biggest-gap.md
    email-3-real-example.md
    email-4-cost-of-waiting.md
    email-5-book-the-call.md

  early-stage/                     -- Early Stage (26-50)
    email-1-score-delivery.md
    email-2-biggest-gap.md
    email-3-real-example.md
    email-4-cost-of-waiting.md
    email-5-book-the-call.md

  developing/                      -- Developing (51-74)
    email-1-score-delivery.md
    email-2-biggest-gap.md
    email-3-real-example.md
    email-4-cost-of-waiting.md
    email-5-book-the-call.md

  advanced/                        -- Advanced (75-100)
    email-1-score-delivery.md
    email-2-biggest-gap.md
    email-3-real-example.md
    email-4-cost-of-waiting.md
    email-5-book-the-call.md
```

## Implementation

See [setup-guide.md](setup-guide.md) for full step-by-step instructions covering Resend domain verification, Supabase webhook configuration, n8n workflow setup, and a testing checklist.
