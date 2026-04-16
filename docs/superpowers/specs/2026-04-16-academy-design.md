# Sagacity Academy — Design Spec

**Date:** 2026-04-16
**Status:** Approved design, ready for implementation planning
**Author:** Denise Isaac + Claude (brainstorming session)

---

## 1. Purpose

Build a self-serve course platform (`/academy`) that lets Sagacity Network sell practical AI, automation, and business-intelligence training to small-business owners. The platform must feel **premium** (Coursera-class UX in Sagacity's brand) and remain **easy to author** (AI-assisted content generation, structured block editor).

The platform sits alongside the existing `/training` enterprise-sales page without replacing it. A single Supabase account serves Academy students today and will serve client-dashboard users later.

## 2. Scope decisions (locked during brainstorming)

- **Account model:** unified Supabase account (Academy + future client dashboard). One users table, role-based access via `user_roles`.
- **Account provisioning:** automatic at Stripe purchase. Magic-link auth (no passwords).
- **Content structure:** `Course → Module → Lesson` (LearnDash/Coursera-style).
- **Per-lesson content types:** rich text, images, video (optional), downloads, inline quizzes, end-of-module quizzes, callouts, code blocks, embeds.
- **Authoring:** structured block editor in admin, backed by Supabase JSONB.
- **AI generation:** Phase 1 only — build-time (Claude chat → JSON → seed script). No runtime admin "Generate" button in MVP.
- **Video hosting:** Vimeo Pro with domain-lock to `sagacitynetwork.net`. Video is optional per lesson.
- **Pricing:** one-time per-course, lifetime access. Stripe Checkout one-off sessions (matches existing Guyana packages pattern).
- **Catalog:** public, SEO-indexed. First lesson per course is free-preview for conversion.
- **Routes:** `/training` stays as enterprise pitch. `/academy` is the new self-serve product.
- **MVP polish deferrals:** no certificates (A2), no fake social proof — testimonials only (B2), minimal progress tracking — completion + % bar (C1).

## 3. Architecture approach

**Chosen:** Approach A — Supabase-native JSON blocks.

Lesson content lives in `lessons.body` (JSONB array of typed blocks). Admin block editor writes there directly. AI seeding writes JSON files to `scripts/academy-seeds/`, a seed script validates with Zod and upserts to Supabase.

Rejected alternatives: Git-first Markdown (deploy-to-edit friction, brittle at 20+ courses), Headless CMS (vendor cost + AI integration overhead for no gain at our scale).

## 4. Route structure

### Public (no auth)
- `/academy` — catalog (SEO-indexed)
- `/academy/[slug]` — course landing (curriculum, price, free-preview link)
- `/academy/[slug]/preview/[lesson-slug]` — free first lesson

### Authed + enrolled
- `/academy/learn/[slug]` — course home (progress + resume)
- `/academy/learn/[slug]/[module]/[lesson]` — lesson player
- `/academy/my-learning` — dashboard of all enrolled courses
- `/account` — profile, purchases, settings

### Admin (role = admin)
- `/admin/academy` — course list
- `/admin/academy/new` — create course
- `/admin/academy/[id]/edit` — block editor (curriculum tree + per-lesson)
- `/admin/academy/[id]/students` — enrollment list + manual grant

### Auth
- `/login` — single magic-link form. Redirects by role post-auth.

### Unchanged
- `/training`, `/book`, `/assessment`, `/admin/*` existing routes

### Access rules
- `/academy/learn/*` gated by middleware: unauth → `/login?redirect=...`; authed + unenrolled → landing page with "Enrol to continue" banner.
- `/academy/[slug]/preview/[lesson-slug]` only renders the lesson when `is_free_preview=true`; otherwise 404 → "enrol to continue" redirect. Enforced at the page level and by RLS.
- Full lessons require enrollment (RLS-enforced on `lessons` SELECT).

## 5. Data model

Eight tables. Additive-only migration. RLS on every table. All eight ship in Slice 1.

```sql
-- Courses
courses(
  id uuid pk,
  slug text unique,              -- "ai-for-small-business"
  title text,
  subtitle text,
  description text,              -- long-form markdown
  hero_image_url text,
  price_cents int,               -- 0 = free
  stripe_price_id text,
  level text,                    -- "beginner" | "intermediate" | "advanced"
  duration_minutes int,          -- cached aggregate
  status text,                   -- "draft" | "published"
  instructor_name text,
  instructor_bio text,
  published_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)

-- Modules (sections within a course)
modules(
  id uuid pk,
  course_id uuid fk,
  title text,
  summary text,
  position int,
  created_at timestamptz
)

-- Lessons
lessons(
  id uuid pk,
  module_id uuid fk,
  slug text,                     -- unique within course
  title text,
  summary text,
  body jsonb,                    -- array of Block (see Section 6)
  duration_minutes int,
  is_free_preview boolean default false,
  position int,
  created_at timestamptz
)

-- Enrollments
enrollments(
  id uuid pk,
  user_id uuid fk → auth.users,
  course_id uuid fk,
  source text,                   -- "stripe" | "manual" | "comp"
  stripe_session_id text,        -- unique, idempotency anchor
  enrolled_at timestamptz,
  granted_by uuid null,          -- admin user_id for manual grants
  unique(user_id, course_id)
)

-- Lesson progress
lesson_progress(
  id uuid pk,
  user_id uuid fk → auth.users,
  lesson_id uuid fk,
  completed_at timestamptz null,
  last_viewed_at timestamptz,
  unique(user_id, lesson_id)
)

-- Quiz attempts
quiz_attempts(
  id uuid pk,
  user_id uuid fk → auth.users,
  lesson_id uuid fk,
  block_id text,                 -- stable nanoid from lessons.body
  answers jsonb,                 -- {questionId: choiceIdOrArray}
  score numeric,                 -- 0.0 - 1.0
  attempted_at timestamptz,
  index(user_id, lesson_id)
)

-- Roles (allows one user to be student + admin + client)
user_roles(
  user_id uuid fk → auth.users,
  role text,                     -- "student" | "admin" | "client"
  granted_at timestamptz,
  primary key(user_id, role)
)

-- Audit log
academy_audit_log(
  id uuid pk,
  actor_id uuid null,
  action text,                   -- "enroll_stripe" | "enroll_manual" | "publish" | ...
  subject_type text,             -- "course" | "enrollment" | ...
  subject_id uuid,
  metadata jsonb,
  created_at timestamptz
)
```

### RLS policies
- `courses`, `modules`: public SELECT where `status='published'`; admin writes
- `lessons`: public SELECT where `is_free_preview=true`; authed SELECT if enrollment exists for the lesson's course; admin writes
- `enrollments`: user SELECTs own rows; writes service-role only (webhook + manual admin action)
- `lesson_progress`, `quiz_attempts`: user reads/writes own rows only
- `user_roles`, `academy_audit_log`: service-role only

### Why JSONB not a `blocks` table
Lesson reads are always whole-lesson. JSONB keeps reads to one row, makes versioning trivial (snapshot the whole body in a future `lesson_versions` table), and matches the AI seeding shape.

## 6. Content block system

`lessons.body` is a `Block[]`. Each block has a stable `id` (nanoid) so `quiz_attempts.block_id` survives edits.

Ten block types in v1:

```ts
type Block =
  | { id: string; type: "heading"; level: 2 | 3; text: string }
  | { id: string; type: "text"; markdown: string }
  | { id: string; type: "image"; url: string; alt: string; caption?: string; width?: number; height?: number }
  | { id: string; type: "video"; provider: "vimeo"; vimeoId: string; title?: string; durationSeconds?: number }
  | { id: string; type: "callout"; variant: "info" | "warning" | "success" | "tip"; title?: string; markdown: string }
  | { id: string; type: "download"; label: string; url: string; fileSize?: string; fileType?: string }
  | { id: string; type: "code"; language: string; code: string; caption?: string }
  | { id: string; type: "quiz"; prompt: string; questions: QuizQuestion[]; passingScore?: number; feedback?: { correct: string; incorrect: string } }
  | { id: string; type: "divider" }
  | { id: string; type: "embed"; provider: "loom" | "figma" | "codesandbox" | "generic-iframe"; url: string; height?: number };

interface QuizQuestion {
  id: string;
  type: "single-choice" | "multi-choice" | "true-false";
  question: string;
  options: { id: string; text: string }[];
  correctIds: string[];
  explanation?: string;
}
```

### Rendering contract
`<BlockRenderer blocks={lesson.body} lessonId={...} onEvent={...} />` switches on `type`. Each block component reports interaction events (quiz submit, download click, mark complete) to the lesson page, which writes to `lesson_progress` / `quiz_attempts`.

### Validation
Single Zod schema at `src/lib/academy/schema.ts` consumed by:
1. Seed script (validates JSON before DB write)
2. Admin block editor (form typing + inline errors)
3. Server actions (rejects malformed body updates)
4. BlockRenderer (TS narrowing)

### Explicitly excluded from v1
Student file uploads, comment threads, peer review, interactive code runners, slide decks, image galleries. Each is a scope iceberg; add when a student asks.

## 7. Auth + Stripe → enrollment flow

### Flow A — new buyer
1. Landing `/academy/[slug]` → "Enrol — £X"
2. Capture email + name (one field each, no password)
3. `POST /api/academy/checkout`:
   - Find-or-create `auth.users` row for email
   - Create Stripe Checkout Session with `metadata.user_id`, `metadata.course_id`, `customer_email`
   - `success_url = /academy/welcome?session_id={CHECKOUT_SESSION_ID}`
4. Stripe Checkout (hosted) → payment
5. Webhook `POST /api/academy/webhook` handles `checkout.session.completed`:
   - Verify Stripe signature
   - Insert `enrollments` (idempotent on `stripe_session_id` unique index)
   - Insert `user_roles(user_id, 'student')` if absent
   - Trigger Supabase magic-link email
   - Write `academy_audit_log` row
6. `/academy/welcome` polls `/api/academy/enrollment-status?session_id=...` once
   - Success → "Check your inbox for a login link"
   - Failure → clear support copy
7. Magic-link click → authenticated → `/academy/learn/[slug]`

### Flow B — existing authed buyer
- Same checkout, but `/academy/welcome` detects session → redirect direct to `/academy/learn/[slug]`

### Flow C — manual grant
- `/admin/academy/[id]/students` → "Grant access" form
- Server action inserts `enrollments` with `source='manual'`, `granted_by=admin_id`
- Optional magic-link email dispatch
- Audit-logged

### Why email-first, magic-link, no OAuth (MVP)
- Fewer friction steps; converts better (Teachable/Udemy pattern)
- We already have the email from Stripe
- No password UI/flows/reset/leak risk
- OAuth adds trust friction on first visit; add Google later via one Supabase config change if data justifies

### Webhook safety
- Signature verification (401 otherwise)
- `enrollments.stripe_session_id` unique index for replay safety
- Stripe's 3-day retry handles transient failures; we log every failed enrollment insert with a Resend alert to Denise

### Session handling
- `@supabase/ssr` across app (extend existing admin pattern)
- Middleware refreshes session on `/academy/learn/*` and `/admin/*`
- Auth redirect preserves `?redirect=` target

### Failure handling
- Webhook before user closes browser → welcome page polls, catches up
- Webhook never arrives → Resend alert to Denise; manual grant
- Email mismatch → impossible; we pre-create account with checkout email
- Lost magic link → `/login` re-sends anytime
- Double-purchase → unique `(user_id, course_id)` blocks it; UI hides buy button if enrolled

## 8. Admin authoring + AI seeding

### Path 1 — AI-seeded (primary)
1. Denise + Claude chat: topic, outline, audience
2. Claude emits full course JSON matching the schema (course + modules + lessons + blocks)
3. Save to `scripts/academy-seeds/<course-slug>.json`
4. `npm run seed:academy -- <course-slug>`:
   - Validate against Zod schema
   - Upsert course, modules, lessons in one transaction
   - Status defaults `draft`
   - Print admin URL for review
5. Denise reviews in admin editor, corrects Claude's output
6. Click Publish when ready

### Path 2 — Block editor (secondary, for edits + non-AI content)
`/admin/academy/[id]/edit` UI:
- Left rail: curriculum tree (modules + lessons, drag-reorder)
- Right pane: selected lesson's block list
- Block types inserted via button bar; each inline-editable
- Up/down arrows + drag handle for reorder
- Autosave every 10s with "Saved Xs ago" indicator
- Manual save button
- "Preview as student" opens lesson in a new tab with admin preview bypass
- Course-level publish toggle (not per-lesson)

### Media uploads
- Supabase Storage bucket `academy-assets`
- Public read for images, signed URLs for downloads (entitlement rechecked server-side each fetch)
- Drag-drop into block → upload → URL captured → block body updated
- `fileSize` + `fileType` captured at upload time for Download blocks

### Why not a third-party editor (Tiptap, Editor.js)
Our block types have domain logic (quiz scoring, download entitlement, Vimeo ID validation) that doesn't fit third-party schemas without glue code that exceeds the cost of a focused custom editor (~500 LOC). The editor is the correction tool, not the creation tool; AI seeding is primary.

### Excluded from MVP
Inline collaboration / presence, draft comments, revision-history UI (git history of seed JSONs covers this), media library browser.

## 9. Student experience

Five screens. Each does one job exceptionally well.

### 9.1 `/academy` — catalog
- Hero band with mission statement
- Filter strip: level, search
- 3-col responsive course grid
- Each card: hero image, level pill, title, subtitle, `{n} modules · {duration}`, price
- Hover = gold glow, subtle rise
- Entire card is one link

### 9.2 `/academy/[slug]` — course landing
- Hero: level pill, title, subtitle, `{modules} · {lessons} · {duration} · Lifetime access`, Enrol CTA, Free-preview CTA
- Instructor card (photo, name, role, bio)
- Curriculum accordion — every lesson visible, free-preview is a real link, locked lessons show lock icon (no deception)
- What you'll learn (bulleted outcomes)
- Testimonials (curated, static, up to 3 — not fake-generated)
- FAQ (access duration, certificates, refund policy)
- Sticky mobile enrol bar (appears on scroll)

### 9.3 `/academy/learn/[slug]` — course home
- Header: title, progress bar (gold on indigo) with % + time remaining
- Big "Resume: {module} · {lesson}" button (reads `lesson_progress.last_viewed_at DESC LIMIT 1`)
- Full curriculum, in-progress module expanded
- Lesson status icons: ✔ done, ● current, ○ upcoming
- "Downloads from this course" aggregated list at bottom

### 9.4 `/academy/learn/[slug]/[module]/[lesson]` — lesson player
- Sticky top bar (56px): back link, lesson title, progress pips (one per lesson), `⌘K` search, completion icon
- Split pane: collapsible curriculum rail (280px, remembers state in localStorage) + lesson body (~720px max-width)
- Body rendered by `<BlockRenderer>`
- Quiz blocks interactive inline; submit shows correctness + explanation; retake allowed
- Video via Vimeo embed: `responsive`, `title=0`, `byline=0`, `dnt=1`, chromeless
- Video playback position persists per lesson
- Downloads as file cards (icon + filename + size + download button), signed URL fetched on click
- "Mark complete" button (explicit click, not scroll-based)
- Auto-advance: 4s countdown on "Next lesson →" after mark-complete, cancellable
- Keyboard: `J` next, `K` previous, `M` mark complete, `⌘K` search, `?` help

### 9.5 `/academy/my-learning` — dashboard
- Three sections: Continue learning / Completed / Not started
- Each a grid of course cards with progress + primary action
- "Browse more courses" cross-sell at bottom

### Micro-details that compound into "wow"
- Reading-mode toggle (hide curriculum rail for full-width focus)
- Font-size control (3 steps, persisted per user)
- Dark-mode default, light-mode toggle
- Copy-link buttons on headings
- Estimated reading time per lesson (word count + video duration)
- Subtle confetti burst on course completion (1.5s, brand colors)
- "This lesson doesn't exist — resume here" 404 page
- Reconnecting toast on network failure, not error 500
- Skeletons matching final layout, not spinners
- 200ms ease-out transitions on `/academy/learn/*` navigation (Next 16 View Transitions API)

### Performance targets
- `/academy/learn/*` LCP < 1.5s on 4G
- Video starts < 500ms after click (Vimeo CDN)
- `/academy` catalog static (ISR, 60s revalidation)

## 10. Implementation staging

Five shippable slices, each independently deployable, each leaving `main` working.

### Slice 1 — Foundation
- Migration: 8 tables + RLS
- Supabase Auth magic-link flow + `/login` page
- `@supabase/ssr` session helper centralized
- `user_roles` seeded (Denise = admin)
- Zod schemas for Blocks + full course JSON
- Feature flag `ACADEMY_ENABLED` in root layout
- **Ships:** infrastructure only, no public changes

### Slice 2 — Public catalog
- `/academy`, `/academy/[slug]`, `/academy/[slug]/preview/[lesson-slug]`
- `<BlockRenderer>` (all 10 block types)
- Hardcoded "Coming soon" button (no purchase yet)
- One seeded course in draft (for testing)
- **Ships:** public academy pages; no purchases

### Slice 3 — Stripe + enrollment
- `/api/academy/checkout`, `/api/academy/webhook`, `/academy/welcome`
- Magic-link dispatch on enrollment
- Resend alert on enrollment-insert failure
- `academy_audit_log` wired
- Stripe test mode end-to-end
- **Ships:** real purchase flow in test mode

### Slice 4 — Authed learning
- `/academy/learn/[slug]` course home
- `/academy/learn/[slug]/[module]/[lesson]` lesson player
- Quiz block interactions → `quiz_attempts`
- Mark-complete → `lesson_progress`
- `/academy/my-learning`
- Keyboard shortcuts, View Transitions, sticky UI
- **Ships:** paying students can complete courses end-to-end

### Slice 5 — Admin authoring + go-live
- `/admin/academy` list + new-course form
- `/admin/academy/[id]/edit` block editor (tree + per-lesson editor + autosave)
- `/admin/academy/[id]/students` (list + manual grant)
- `scripts/seed-academy.ts` with Zod validation + idempotent upsert
- Seed the AI course
- Stripe live mode toggle
- **Ships:** revenue-earning system

Estimated total: ~2 weeks focused build time.

## 11. Testing

Not comprehensive unit coverage. Focused on risk:

### Automated (~15 tests)
- `src/lib/academy/schema.test.ts` — Zod round-trip every block type; rejects malformed input
- `src/lib/academy/stripe-webhook.test.ts` — signature verification, idempotency, missing metadata
- `supabase/tests/academy-rls.sql` — unauthed blocked from non-preview lessons; authed-unenrolled blocked; enrolled sees content; admin sees all
- `src/app/api/academy/checkout.test.ts` — user create vs lookup, Stripe metadata correctness

### Manual verification checklist (`docs/academy-testing.md`)
Run before each slice ships:
- [ ] New-email purchase → magic link → login → course → lesson plays
- [ ] Existing-email purchase → straight into course after Stripe
- [ ] Unauth `/academy/learn/*` → redirect to login
- [ ] Authed unenrolled `/academy/learn/*` → redirect to landing with banner
- [ ] Complete lesson → progress updates → resume → next lesson
- [ ] Quiz submission → score stored → retake works
- [ ] Download PDF via signed URL
- [ ] Publish course → appears in `/academy` within seconds
- [ ] Manual grant → test email gets access
- [ ] Stripe refund → enrollment preserved (manual admin action only)

### Performance
Lighthouse on `/academy/learn/[slug]/[module]/[lesson]` after Slice 4: LCP < 1.5s, CLS < 0.1, TBT < 200ms.

## 12. Observability

Solo operator — need push notifications, not dashboard vigilance.

- Resend alerts → `denise@sagacitynetwork.net` on:
  - Stripe signature failures (auth-bypass attempts)
  - Enrollment insert failure after successful Stripe payment
  - Magic-link send failure
- `academy_audit_log` table — append-only history of every enrollment, manual grant, publish
- Vercel Analytics (already on)
- Sentry deferred to post-revenue

## 13. Rollback

- Every slice `git revert`-able
- Migrations additive-only after Slice 1; never rename/drop in production
- Feature flag `ACADEMY_ENABLED=false` in root layout disables all `/academy` routes → redirect to `/training` with "Back soon" banner
- Migration inverses documented in migration file comments (not auto-down)

## 14. Out of scope (v2+)

- Certificates
- Student-submitted assignments / file uploads
- Discussion threads / community
- Peer review
- Cohort-based courses
- Subscription / all-access pass
- Bundle pricing
- Affiliate/referral program
- Runtime admin "Generate with AI" button
- Interactive code runners / labs
- Lesson version history UI (schema ready, UI deferred)
- Mobile native app

## 15. Open questions

None at spec time. Any ambiguity discovered during implementation will be raised in the plan document before code is written.
