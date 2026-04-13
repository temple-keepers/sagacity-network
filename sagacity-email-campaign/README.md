# Sagacity Network — Post-Assessment Email Campaign

## What This Is

A 5-email automated welcome sequence that fires after someone completes the Sagacity Network Digital Readiness Assessment. The campaign is sent via Resend, triggered by a new row in the Supabase `leads` table.

There are 4 audience segments based on score band. Each segment gets the same 5-email structure with different content tailored to their digital maturity level. That's 20 emails total.

## The 4 Segments

| Band | Score Range | Profile |
|------|------------|---------|
| **Digitally At Risk** | 0–25 | Little or no web presence, no follow-up systems, no security, heavy manual admin |
| **Early Stage** | 26–50 | Some basics in place but inconsistent. Getting enquiries but losing them |
| **Developing** | 51–74 | Solid foundations. Website works. Some automation. Ready to act |
| **Advanced** | 75–100 | Strong across the board. Looking to compound their advantage with AI and systems |

## The 5-Email Sequence

| Email | Timing | Purpose |
|-------|--------|---------|
| Email 1 | Immediately | Deliver the score, confirm what it means, set expectations |
| Email 2 | Day 1 (24h) | Deep dive on their single biggest gap |
| Email 3 | Day 3 | A real example of what fixing that gap looks like |
| Email 4 | Day 5 | The cost of leaving it unfixed — specific numbers |
| Email 5 | Day 7 | Book the free Digital Clarity Call |

## Folder Structure

```
sagacity-email-campaign/
├── README.md                          ← You're here
├── setup-guide.md                     ← Full technical setup instructions
│
├── at-risk/                           ← Digitally At Risk (0–25)
│   ├── email-1-score-delivery.md
│   ├── email-2-biggest-gap.md
│   ├── email-3-real-example.md
│   ├── email-4-cost-of-waiting.md
│   └── email-5-book-the-call.md
│
├── early-stage/                       ← Early Stage (26–50)
│   ├── email-1-score-delivery.md
│   ├── email-2-biggest-gap.md
│   ├── email-3-real-example.md
│   ├── email-4-cost-of-waiting.md
│   └── email-5-book-the-call.md
│
├── developing/                        ← Developing (51–74)
│   ├── email-1-score-delivery.md
│   ├── email-2-biggest-gap.md
│   ├── email-3-real-example.md
│   ├── email-4-cost-of-waiting.md
│   └── email-5-book-the-call.md
│
└── advanced/                          ← Advanced (75–100)
    ├── email-1-score-delivery.md
    ├── email-2-biggest-gap.md
    ├── email-3-real-example.md
    ├── email-4-cost-of-waiting.md
    └── email-5-book-the-call.md
```

## How Each Email File Is Formatted

Every email file contains:

```
SUBJECT: [subject line]
PREVIEW: [preview text for inbox]

---

[Full email body — plain text, ready to paste into Resend]
```

## Template Variables

These are pulled from the Supabase `leads` table and passed to Resend at send time:

| Variable | Content |
|----------|---------|
| `{{name}}` | First name |
| `{{email}}` | Email address |
| `{{business}}` | Business name (may be blank) |
| `{{score}}` | Numerical score 0–100 |
| `{{band}}` | Digitally At Risk / Early Stage / Developing / Advanced |
| `{{q1}}` – `{{q8}}` | Individual category scores |
| `{{utm_source}}` | Traffic source |

## How It's Set Up

The campaign is fully wired through Supabase + Resend — no external automation tool. A database trigger queues 5 emails when a lead is inserted, and a `pg_cron` job hits a Supabase Edge Function (`process-assessment-queue`) every minute to send anything that's due.

See [setup-guide.md](setup-guide.md) for the architecture, the two manual secret values you need to set in the Supabase dashboard, the testing checklist, and operational SQL (pause, edit a template, inspect failures, etc.).

The Edge Function source lives in `edge-function/index.ts`. The 20 email templates are seeded into Supabase via `seed_email_templates.sql` — re-run it any time you edit the `.md` files.

## Voice and Tone

All emails are written as Denise, in first person. Direct, warm, expert. Short paragraphs, no bullet points, no hype, no generic agency language. Every email ends with a personal sign-off from Denise.

## Booking Link

All CTAs point to: https://calendly.com/sagacitynetwork
