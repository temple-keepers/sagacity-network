# Academy Slice 3 — Checkout, Enrolment & Paid Learning

**Date:** 2026-04-16
**Status:** Approved, ready for plan
**Slice scope:** Option B (minimum viable paid course + progress tracking)

## Context

Slice 1 shipped the Academy data foundation (tables, RLS, auth, feature flag). Slice 2 shipped the public browsing surface (catalog, course landing, free preview). Slice 3 turns the Academy from a brochure into a working paid-course product: learners can pay, get access, read paid lessons, and track their progress.

## Scope summary (decisions already made)

| Decision | Choice |
|---|---|
| Scope | Minimum viable paid course + progress tracking (no certificates, no graded quizzes yet) |
| Checkout flow order | Login-first — sign in before being sent to Stripe |
| VAT / tax | None. Sagacity is not VAT-registered; prices are flat £ amounts |
| Admin notifications | Email on enrolment + a full `/admin/enrolments` page |
| Refund flow | Handled in Stripe dashboard; webhook flips status in our database |
| Mark-as-complete UX | Manual "Mark as complete" button at the bottom of each lesson |
| Currency | GBP |
| Stripe pricing model | Ad-hoc `price_data` at checkout session creation — no Stripe Product records (matches existing Guyana pattern) |

## Architecture at a glance

```
Enrol:  Enrol btn → /api/academy/checkout → Stripe Hosted Checkout
                                              │
                                              ▼
        webhook ← checkout.session.completed ← payment OK
           │
           └─► insert into enrollments (status='active')
                 + Resend email to Sagacity
                 + redirect learner to /academy/my-learning

Learn:  /academy/[slug]/learn/[lessonSlug]
           │
           ├─► RLS on `lessons` checks enrollment exists + active
           └─► if not enrolled → redirect to /academy/[slug]

Refund: Stripe dashboard refund → charge.refunded webhook
           │
           └─► update enrollments set status='refunded'
                 (RLS blocks future reads)
```

## Routes

| Route | Purpose |
|---|---|
| `POST /api/academy/checkout` | Creates a Stripe Checkout Session for the signed-in learner + given course. 401 if not signed in, 409 if already enrolled. |
| `POST /api/academy/webhook` | Receives Stripe events. Signature-verified. Handles `checkout.session.completed` and `charge.refunded`. Idempotent via stored event ids. |
| `POST /api/academy/progress` | Marks one lesson complete for the signed-in learner. Idempotent. |
| `GET /academy/my-learning` | Learner dashboard. Shows enrolled courses + progress bars + Continue buttons. |
| `GET /academy/[slug]/learn/[lessonSlug]` | Paid lesson page. RLS-gated by active enrolment. |
| `GET /admin/enrolments` | Admin list of all enrolments. Stats + filters + table. |

## Database changes

All additive. Applied as one migration via Supabase MCP, in the same pattern as Slice 1/2 migrations.

**`enrollments` table — add columns if missing:**
- `stripe_checkout_session_id text unique` — idempotency anchor for the webhook.
- `stripe_customer_id text` — correlation for future refunds / subscriptions.
- `amount_paid_cents integer` — denormalised price at purchase time (course prices may change; this doesn't).

**`enrollments.status` allowed values:** `active | refunded | expired`.

**`stripe_webhook_events` table — new:**
- `event_id text primary key`
- `type text`
- `received_at timestamptz default now()`
- Purpose: stop duplicate webhook deliveries from double-inserting enrolments.

**RLS policies — add:**
- `lessons.SELECT`: allow when `is_free_preview = true` OR the learner has an `active` enrolment for the parent course.
- `lesson_progress.SELECT / INSERT / UPDATE`: allow only when `user_id = auth.uid()`.

## Checkout flow

Client side — the "Enrol" button on `/academy/[slug]`:

1. If user not signed in → redirect to `/login?redirect=/academy/[slug]?enrol=1`.
2. If signed in → POST `/api/academy/checkout` with `{ courseSlug }`.
3. Receive `{ url }` → `window.location.href = url`.

Server side — the `/api/academy/checkout` handler:

1. Read user from Supabase server cookie; 401 if none.
2. Look up course by slug where `status = 'published'`; 404 if not found.
3. Check existing `active` enrolment for this user + course; 409 if present.
4. Create Stripe Checkout Session:
   - `mode: 'payment'`
   - `currency: 'gbp'`
   - `line_items` using ad-hoc `price_data` from `course.price_cents`
   - `client_reference_id: user.id`
   - `metadata: { course_id, user_id }`
   - `customer_email: user.email` (so Stripe pre-fills)
   - `success_url: /academy/my-learning?welcome=1`
   - `cancel_url: /academy/[slug]`
5. Return `{ url: session.url }`.

## Webhook handler

Endpoint: `POST /api/academy/webhook`. Must use Next.js raw-body reading (no JSON parse) so Stripe signature verification works.

**Steps:**

1. Verify signature using `STRIPE_WEBHOOK_SECRET`. Reject 400 on failure.
2. Check `stripe_webhook_events` for this `event.id`; if present, return 200 immediately (idempotent — we already processed this).
3. In a single database transaction:
   a. Insert the event row.
   b. Apply the side-effect based on `event.type`:
      - **`checkout.session.completed`:** pull `user_id` and `course_id` from `metadata`; insert `enrollments` row with `status='active'`, `stripe_checkout_session_id`, `stripe_customer_id`, `amount_paid_cents = session.amount_total`.
      - **`charge.refunded`:** find enrolment by `stripe_checkout_session_id` (pulled from the charge's payment intent); set `status='refunded'`.
   c. Commit.
4. If the transaction failed, return 500 so Stripe retries the delivery.
5. After a successful enrolment commit (outside the transaction), send the Resend email to Sagacity. Email failure is logged but does not fail the webhook.
6. Return 200.

## Paid lesson page (`/academy/[slug]/learn/[lessonSlug]`)

**Layout:** reuses `LessonSidebar` and `BlockRenderer` from Slice 2.

**Differences vs. the preview page:**

- Sidebar: lock icons removed for enrolled users (they can click any lesson). Completed lessons show a green tick.
- Top of page: small progress bar — "3 of 12 lessons · 25%".
- Bottom of page:
  - **Mark as complete** button (primary).
  - **Previous lesson** / **Next lesson** buttons (secondary).
- Quiz blocks become interactive (learner picks answers, sees which are right) but results are not stored — that's Slice 4.

**Access control (belt-and-braces):**

1. Database RLS refuses the lesson row unless enrolled.
2. Page-level: if the server fetch returns null and the lesson is not a free preview, redirect to `/academy/[slug]` with a "sign in or enrol to read this" banner.

## `/academy/my-learning` page

Signed-in-only. Page-level check: if not signed in, redirect to `/login?redirect=/academy/my-learning`. (Page-level rather than middleware for consistency with Slice 2's feature-flag `notFound()` pattern.)

**Layout:**
- Header: "My Learning".
- Grid of course cards (same `CourseCard` visual language as the catalog, with progress added):
  - Hero image
  - Course title
  - Progress bar + "3 of 12 lessons"
  - **Continue** button → `/academy/[slug]/learn/[nextUnfinishedLessonSlug]`
  - Smaller link: "View curriculum" → `/academy/[slug]`
- Empty state when no enrolments: friendly message + **Browse courses** button → `/academy`.
- Only shows `status='active'` enrolments; refunded/expired hidden.

**Nav change:** the top `Nav` component shows a **"My Learning"** link only when the user is signed in. Detected server-side in the site layout and passed as a prop, same pattern as the existing `academyEnabled` flag.

## `/admin/enrolments` page

Matches the look and feel of `/admin/leads` and `/admin/contacts`.

**Stat cards (3):**
- Total enrolments (all time)
- Revenue this month (£, from `amount_paid_cents` sum for active enrolments in the current month)
- Active learners (distinct users with at least one active enrolment)

**Filter bar:**
- Course (dropdown, "All courses" by default)
- Status (Active / Refunded / All)
- Date range (This month / Last 30 days / All time)

**Table columns:**
- Learner name + email
- Course title
- Enrolled date
- Amount paid (£)
- Status pill
- Progress ("N of M")
- "View in Stripe" link (opens session in new tab)

**Sort:** newest first.

**Refresh button** at top — reuses existing `RefreshButton`.

**No edit/delete actions.** Enrolments are financial records and stay immutable in our database; status changes only flow in from Stripe via the webhook.

## Progress tracking

**Storage:** `lesson_progress` rows `(user_id, lesson_id, completed_at)`. One row per completed lesson per learner. Unique on `(user_id, lesson_id)`.

**Write path:** "Mark as complete" button calls `POST /api/academy/progress` with `{ lesson_id }`. Endpoint:
- 401 if not signed in.
- Verifies lesson belongs to a course the user has an active enrolment for.
- Upserts on `(user_id, lesson_id)` — duplicates silently ignored.
- Returns new completed count for the course so the UI can refresh without a full reload.

**Read paths:**
- Learn page: fetches completed lesson ids for the course on initial load; sidebar decorates ticks locally.
- My Learning page: fetches completed counts per course.
- Next-lesson logic: client computes the next unfinished lesson by scanning ordered lessons and comparing to the completed set.

**RLS:** `lesson_progress` SELECT/INSERT/UPDATE restricted to `user_id = auth.uid()`.

**Retention policy:** progress rows are **not** deleted on refund — so re-enrolment restores the learner's progress. Access is purely a function of enrolment status, not progress existence.

## Email notification

**Trigger:** inside the webhook, after `checkout.session.completed` inserts the enrolment row.

**Template:** lives alongside existing welcome-sequence templates.

**Subject:** `New Academy enrolment — <learner name>`

**Body:**
```
<learner name> (<email>) just enrolled in "<course title>" for £<amount>.

View in Stripe: <stripe-session-url>
Open admin enrolments: <admin-enrolments-list-url>
```

**Failure handling:** wrapped in try/catch. On failure, log the error but do not fail the webhook (enrolment still succeeds; Sagacity can find the enrolment in admin regardless).

## New environment variables

| Name | Scope | Purpose |
|---|---|---|
| `STRIPE_WEBHOOK_SECRET` | Preview + Production | Verify webhook signatures. Issued per endpoint in Stripe dashboard. |

Existing vars reused: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `ACADEMY_ENABLED`.

## Out of scope (defer to later slices)

- Certificates of completion (Slice 4)
- Graded quiz attempts stored in DB (Slice 4)
- Course bundles / discount codes (Slice 5)
- Subscription / membership pricing (Slice 5)
- Invoices / VAT handling (when Sagacity registers for VAT)
- Learner-to-learner community features
- Course comments or Q&A threads
- Mobile app / offline viewing

## Verification plan

After implementation:

1. `npm run build` passes with zero errors.
2. `npm test` passes — add targeted tests for:
   - checkout API: auth guard, 409 on double-enrol, GBP currency, correct metadata shape
   - webhook: signature verification rejects bad payloads, idempotency skips duplicate event ids, refund event flips status
   - progress API: 401 guard, enrolment guard, idempotent upsert
3. Supabase advisor check: no new warnings beyond the pre-existing ones.
4. Smoke test on Vercel preview with a Stripe test card (`4242 4242 4242 4242`):
   - Enrol → land on my-learning
   - Open a paid lesson, mark complete, see tick + progress bar advance
   - Refund the payment in Stripe dashboard → within seconds, learner loses access on refresh
   - Admin sees the enrolment row flip to "Refunded"
   - Email received on initial enrolment
