# Academy Slice 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the minimum viable paid-course experience: login-first Stripe Checkout, webhook-driven enrolment, RLS-gated paid lessons, manual mark-as-complete progress tracking, a `/academy/my-learning` dashboard, and a full `/admin/enrolments` admin page.

**Architecture:** Login-first checkout using Stripe Hosted Checkout with ad-hoc `price_data` (no Stripe Product records). A signed-verified webhook writes enrolment rows transactionally and fires a Resend notification. Paid lesson access is gated at the database level via RLS checking active enrolments. Progress tracking is a simple `lesson_progress` insert on button click. All academy routes remain behind the `ACADEMY_ENABLED` feature flag from Slice 1.

**Tech Stack:** Next.js 16.2.3 App Router (server components + client islands), Supabase (Postgres + RLS + Auth magic-link), Stripe (SDK `stripe@latest`, Hosted Checkout), Resend (email), Vitest (tests), Tailwind 4. Feature flag: `ACADEMY_ENABLED`. Currency: GBP. No VAT. Language: plain English in error messages for amateur learners.

**Spec:** `docs/superpowers/specs/2026-04-16-academy-slice-3-design.md`

**Branch:** continue on `academy-slice-1` (where Slice 2 merged into), create feature branch `academy-slice-3`.

---

## File structure

**New files:**

| Path | Responsibility |
|---|---|
| `supabase/migrations/20260416000400_academy_slice_3.sql` | Adds enrolment columns, `stripe_webhook_events` table, RLS policies for paid-content gating and progress |
| `src/lib/academy/stripe.ts` | Lazy-initialised Stripe client + typed helpers |
| `src/lib/academy/enrollment-queries.ts` | Server-side queries: enrolment lookups, progress counts, course access checks |
| `src/lib/emails/academy-enrolment.ts` | Resend template + sender for new-enrolment notification |
| `src/app/api/academy/checkout/route.ts` | POST — creates a Stripe Checkout Session |
| `src/app/api/academy/webhook/route.ts` | POST — handles Stripe events (signature-verified, idempotent) |
| `src/app/api/academy/progress/route.ts` | POST — marks a lesson complete |
| `src/app/(site)/academy/my-learning/page.tsx` | Learner dashboard |
| `src/app/(site)/academy/[slug]/learn/[lessonSlug]/page.tsx` | Paid lesson page (server) |
| `src/app/(site)/academy/[slug]/learn/[lessonSlug]/LessonControls.tsx` | Client: mark-complete button + prev/next |
| `src/components/academy/EnrolButton.tsx` | Client: "Enrol" button with login redirect + checkout POST |
| `src/components/academy/EnrolledCourseCard.tsx` | My-learning card with progress |
| `src/components/academy/LessonProgressBar.tsx` | Top-of-lesson progress bar |
| `src/app/admin/(console)/enrolments/page.tsx` | Admin enrolments page (server) |
| `src/app/admin/(console)/enrolments/EnrolmentsTable.tsx` | Client: table with filters |

**Modified files:**

| Path | Change |
|---|---|
| `src/app/(site)/academy/[slug]/page.tsx` | Replace disabled "Enrol — coming soon" with `<EnrolButton />` |
| `src/components/academy/LessonSidebar.tsx` | Accept `completedLessonIds` and `isEnrolled` props; tick completed lessons; unlock paid ones when enrolled |
| `src/components/academy/BlockRenderer.tsx` | Pass `isEnrolled` down so QuizBlock can go interactive |
| `src/components/academy/blocks/QuizBlock.tsx` | Add interactive mode (learner picks answers, sees right/wrong) |
| `src/components/layout/Nav.tsx` | Show "My Learning" link when `isSignedIn` prop is true |
| `src/app/(site)/layout.tsx` | Compute `isSignedIn` server-side and pass to `<Nav />` |
| `src/app/admin/(console)/layout.tsx` | Add "Enrolments" to admin sidebar |

**New test files:**

| Path | Covers |
|---|---|
| `src/lib/academy/enrollment-queries.test.ts` | Pure shape tests |
| `src/app/api/academy/checkout/route.test.ts` | Auth guard, 409 on double-enrol, GBP currency, metadata |
| `src/app/api/academy/webhook/route.test.ts` | Signature rejection, idempotency, refund flip |
| `src/app/api/academy/progress/route.test.ts` | 401 guard, enrolment guard, idempotent upsert |

---

## Task 1: Branch setup

**Files:** none

- [ ] **Step 1: Create the feature branch**

```bash
git checkout academy-slice-1
git pull
git checkout -b academy-slice-3
```

- [ ] **Step 2: Verify tests still pass on the starting point**

```bash
npm test
```

Expected: all existing tests pass (24+).

- [ ] **Step 3: Open a draft PR for visibility**

```bash
git push -u origin academy-slice-3
gh pr create --draft --base academy-slice-1 --title "feat(academy): Slice 3 — paid checkout, enrolment, progress" --body "WIP — implementing per docs/superpowers/plans/2026-04-16-academy-slice-3.md"
```

---

## Task 2: Database migration

**Files:**
- Create: `supabase/migrations/20260416000400_academy_slice_3.sql`

- [ ] **Step 1: Inspect current schema to know what's already there**

```bash
# List current columns on enrollments
psql-via-supabase-mcp: SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name='enrollments';
```

Note existing columns so the migration only adds what's missing.

- [ ] **Step 2: Write the migration**

Create `supabase/migrations/20260416000400_academy_slice_3.sql`:

```sql
-- Academy Slice 3 — checkout, enrolment, progress, paid-content gating.
-- Additive only. Safe to apply to an environment that already has
-- Slice 1/2 tables.

-- 1. enrollments columns (add if missing)
alter table public.enrollments
  add column if not exists stripe_checkout_session_id text,
  add column if not exists stripe_customer_id text,
  add column if not exists amount_paid_cents integer;

create unique index if not exists enrollments_stripe_session_unique
  on public.enrollments (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

-- 2. enrollments status check — ensure allowed values
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'enrollments_status_check'
  ) then
    alter table public.enrollments
      add constraint enrollments_status_check
      check (status in ('active','refunded','expired'));
  end if;
end$$;

-- 3. stripe_webhook_events — idempotency log
create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

-- Not exposed to the anon or authenticated roles.
alter table public.stripe_webhook_events enable row level security;
-- No policies = no access for non-service roles. Service role bypasses RLS.

-- 4. RLS — lessons: unlock for enrolled learners OR free previews
drop policy if exists "lessons_read_enrolled_or_preview" on public.lessons;
create policy "lessons_read_enrolled_or_preview"
  on public.lessons for select
  to authenticated
  using (
    is_free_preview = true
    or exists (
      select 1
      from public.enrollments e
      join public.modules m on m.id = lessons.module_id
      where e.user_id = (select auth.uid())
        and e.course_id = m.course_id
        and e.status = 'active'
    )
  );

-- 5. RLS — lesson_progress: learners see/write only their own rows
drop policy if exists "lesson_progress_self_select" on public.lesson_progress;
create policy "lesson_progress_self_select"
  on public.lesson_progress for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "lesson_progress_self_insert" on public.lesson_progress;
create policy "lesson_progress_self_insert"
  on public.lesson_progress for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "lesson_progress_self_update" on public.lesson_progress;
create policy "lesson_progress_self_update"
  on public.lesson_progress for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 6. Helpful indexes
create index if not exists enrollments_user_status_idx
  on public.enrollments (user_id, status);

create index if not exists lesson_progress_user_lesson_idx
  on public.lesson_progress (user_id, lesson_id);
```

- [ ] **Step 3: Apply via Supabase MCP**

Use the Supabase MCP `apply_migration` tool with name `academy_slice_3` and the SQL above. Project: `gnndbcmwjgoxofabukrp`.

- [ ] **Step 4: Verify via advisor check**

Run `get_advisors` with type `security`. Confirm no *new* warnings introduced by this migration (pre-existing warnings on unrelated tables are acceptable).

- [ ] **Step 5: Regenerate database types**

Use the Supabase MCP `generate_typescript_types` tool. Write the output to `src/lib/supabase/database.types.ts`, replacing the existing file.

- [ ] **Step 6: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add supabase/migrations/20260416000400_academy_slice_3.sql src/lib/supabase/database.types.ts
git commit -m "feat(academy): migration for paid-content RLS, stripe events log, progress policies"
```

---

## Task 3: Stripe helper

**Files:**
- Create: `src/lib/academy/stripe.ts`

- [ ] **Step 1: Write the Stripe helper**

```ts
import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Returns a singleton Stripe client. Throws a clear error if the key is missing,
 * which is what we want at request time rather than module load time.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  cached = new Stripe(key);
  return cached;
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/academy/stripe.ts
git commit -m "feat(academy): add Stripe singleton helper"
```

---

## Task 4: Enrolment query library

**Files:**
- Create: `src/lib/academy/enrollment-queries.ts`
- Test: `src/lib/academy/enrollment-queries.test.ts`

- [ ] **Step 1: Write the queries module**

```ts
import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface EnrolledCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string | null;
  total_lessons: number;
  completed_lessons: number;
  next_lesson_slug: string | null;
  enrolled_at: string;
}

/**
 * Returns true when the logged-in user has an active enrolment for the course.
 * Returns false if anonymous or if the enrolment is refunded/expired.
 */
export async function hasActiveEnrolment(courseId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Returns the set of lesson IDs the current user has completed for a course.
 * Empty set for anonymous users.
 */
export async function getCompletedLessonIds(courseId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))")
    .eq("user_id", user.id)
    .eq("lessons.modules.course_id", courseId);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.lesson_id));
}

/**
 * Returns courses the current user is actively enrolled in, with progress counts
 * and the next unfinished lesson slug for the "Continue" button.
 */
export async function getMyEnrolledCourses(): Promise<EnrolledCourse[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
      id, enrolled_at,
      courses!inner (
        id, slug, title, subtitle, hero_image_url,
        modules (
          lessons ( id, slug, position, module_id )
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("enrolled_at", { ascending: false });

  if (error) throw error;

  const completed = new Set<string>();
  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", user.id);
  (progressRows ?? []).forEach((r) => completed.add(r.lesson_id));

  return (data ?? []).map((row) => {
    const course = row.courses;
    const lessons = (course.modules ?? [])
      .flatMap((m) => m.lessons ?? [])
      .sort((a, b) => a.position - b.position);
    const nextLesson = lessons.find((l) => !completed.has(l.id));
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? "",
      hero_image_url: course.hero_image_url,
      total_lessons: lessons.length,
      completed_lessons: lessons.filter((l) => completed.has(l.id)).length,
      next_lesson_slug: nextLesson?.slug ?? null,
      enrolled_at: row.enrolled_at,
    };
  });
}
```

- [ ] **Step 2: Write shape tests**

```ts
import { describe, it, expectTypeOf } from "vitest";
import type { EnrolledCourse } from "./enrollment-queries";

describe("enrollment-queries types", () => {
  it("EnrolledCourse has the required fields", () => {
    expectTypeOf<EnrolledCourse>().toHaveProperty("id").toEqualTypeOf<string>();
    expectTypeOf<EnrolledCourse>().toHaveProperty("completed_lessons").toEqualTypeOf<number>();
    expectTypeOf<EnrolledCourse>().toHaveProperty("next_lesson_slug").toEqualTypeOf<string | null>();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- enrollment-queries
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/academy/enrollment-queries.ts src/lib/academy/enrollment-queries.test.ts
git commit -m "feat(academy): add enrolment and progress query helpers"
```

---

## Task 5: Checkout API route

**Files:**
- Create: `src/app/api/academy/checkout/route.ts`
- Test: `src/app/api/academy/checkout/route.test.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/academy/stripe";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export async function POST(req: NextRequest) {
  if (!isAcademyEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { courseSlug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const courseSlug = body.courseSlug;
  if (!courseSlug || typeof courseSlug !== "string") {
    return NextResponse.json({ error: "courseSlug is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in first" }, { status: 401 });
  }

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, slug, title, price_cents, status")
    .eq("slug", courseSlug)
    .eq("status", "published")
    .maybeSingle();

  if (courseError) {
    console.error("Course lookup failed:", courseError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", course.id)
    .eq("status", "active")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "You are already enrolled" }, { status: 409 });
  }

  const origin = req.headers.get("origin") || "https://sagacitynetwork.net";

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "gbp",
      customer_email: user.email ?? undefined,
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        course_id: course.id,
        course_slug: course.slug,
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { name: course.title },
            unit_amount: course.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/academy/my-learning?welcome=1`,
      cancel_url: `${origin}/academy/${course.slug}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", msg);
    return NextResponse.json({ error: "Could not create checkout session" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/academy/feature-flag", () => ({ isAcademyEnabled: () => true }));
vi.mock("@/lib/academy/stripe", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.test/abc" }) } },
  }),
}));

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mockSupabase,
}));

function makeReq(body: unknown): Request {
  return new Request("http://localhost/api/academy/checkout", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/academy/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReset();
  });

  it("returns 401 when not signed in", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ courseSlug: "x" }) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });

  it("returns 400 when courseSlug is missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b" } } });
    const res = await POST(makeReq({}) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
  });

  it("returns 409 when already enrolled", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1", email: "a@b" } } });
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === "courses") return {
        select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "c1", slug: "x", title: "T", price_cents: 4900, status: "published" }, error: null }) }) }) }),
      };
      if (table === "enrollments") return {
        select: () => ({ eq: () => ({ eq: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: { id: "e1" }, error: null }) }) }) }) }),
      };
      return {};
    });
    const res = await POST(makeReq({ courseSlug: "x" }) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(409);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- api/academy/checkout
```

Expected: 3 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/academy/checkout
git commit -m "feat(academy): add /api/academy/checkout route with auth and double-enrol guards"
```

---

## Task 6: Enrol button on course landing page

**Files:**
- Create: `src/components/academy/EnrolButton.tsx`
- Modify: `src/app/(site)/academy/[slug]/page.tsx`

- [ ] **Step 1: Write the client component**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseSlug: string;
  priceLabel: string;
  isSignedIn: boolean;
}

export default function EnrolButton({ courseSlug, priceLabel, isSignedIn }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!isSignedIn) {
      const redirect = encodeURIComponent(`/academy/${courseSlug}?enrol=1`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/academy/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach the payment page. Please try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] mb-3 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
        style={{ background: "var(--gradient-purple)", color: "#fff" }}
      >
        {pending ? "Redirecting to payment…" : `Enrol — ${priceLabel}`}
      </button>
      {error ? (
        <p className="text-[12px] mt-1" style={{ color: "#d4443a" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Wire it into the course landing page**

In `src/app/(site)/academy/[slug]/page.tsx`, replace the disabled "Enrol — coming soon" button with the new component. The price card currently contains:

```tsx
<button type="button" disabled ...>Enrol — coming soon</button>
```

Replace with:

```tsx
<EnrolButton
  courseSlug={course.slug}
  priceLabel={formatPrice(course.price_cents)}
  isSignedIn={isSignedIn}
/>
```

At the top of the file, add the import:

```tsx
import EnrolButton from "@/components/academy/EnrolButton";
```

In the server component body, read signed-in state before rendering:

```tsx
import { createSupabaseServerClient } from "@/lib/supabase/server";

// inside the async page function, before the return:
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
const isSignedIn = !!user;
```

- [ ] **Step 3: Build and sanity-check**

```bash
npx tsc --noEmit
npm run build
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/academy/EnrolButton.tsx "src/app/(site)/academy/[slug]/page.tsx"
git commit -m "feat(academy): wire up Enrol button with login-first checkout"
```

---

## Task 7: Enrolment email template

**Files:**
- Create: `src/lib/emails/academy-enrolment.ts`

- [ ] **Step 1: Write the template + sender**

```ts
import "server-only";
import { Resend } from "resend";

interface EnrolmentEmailPayload {
  learnerName: string | null;
  learnerEmail: string;
  courseTitle: string;
  amountPaidPence: number;
  stripeSessionUrl: string;
  adminEnrolmentsUrl: string;
}

export async function sendEnrolmentEmail(payload: EnrolmentEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing — skipping enrolment email");
    return;
  }
  const resend = new Resend(apiKey);

  const who = payload.learnerName
    ? `${payload.learnerName} (${payload.learnerEmail})`
    : payload.learnerEmail;
  const amount = `£${(payload.amountPaidPence / 100).toFixed(2)}`;

  const subject = `New Academy enrolment — ${payload.learnerName ?? payload.learnerEmail}`;
  const text = [
    `${who} just enrolled in "${payload.courseTitle}" for ${amount}.`,
    ``,
    `View in Stripe: ${payload.stripeSessionUrl}`,
    `Open admin enrolments: ${payload.adminEnrolmentsUrl}`,
  ].join("\n");

  try {
    await resend.emails.send({
      from: "Sagacity Academy <denise@sagacitynetwork.net>",
      to: "denise@sagacitynetwork.net",
      subject,
      text,
    });
  } catch (err) {
    console.error("Enrolment email failed:", err);
    // deliberately swallow — enrolment must succeed even if email fails
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/emails/academy-enrolment.ts
git commit -m "feat(academy): add Resend template for new-enrolment notification"
```

---

## Task 8: Stripe webhook handler

**Files:**
- Create: `src/app/api/academy/webhook/route.ts`
- Test: `src/app/api/academy/webhook/route.test.ts`

- [ ] **Step 1: Write the webhook**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { getStripe, getWebhookSecret } from "@/lib/academy/stripe";
import { sendEnrolmentEmail } from "@/lib/emails/academy-enrolment";
import type Stripe from "stripe";

// Stripe requires the raw body for signature verification.
export const dynamic = "force-dynamic";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service env vars missing");
  return createClient<Database>(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, getWebhookSecret());
  } catch (err) {
    const msg = err instanceof Error ? err.message : "verification failed";
    console.error("Webhook signature error:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const db = serviceClient();

  // Idempotency: if we've seen this event id before, do nothing.
  const { data: seen } = await db
    .from("stripe_webhook_events")
    .select("event_id")
    .eq("event_id", event.id)
    .maybeSingle();
  if (seen) return NextResponse.json({ ok: true, deduped: true });

  // Record the event, then apply side-effect. If side-effect fails, delete the
  // event row so Stripe's retry will try again.
  const { error: insertEventError } = await db
    .from("stripe_webhook_events")
    .insert({ event_id: event.id, type: event.type });
  if (insertEventError) {
    console.error("Event row insert failed:", insertEventError);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(db, event.data.object as Stripe.Checkout.Session);
    } else if (event.type === "charge.refunded") {
      await handleChargeRefunded(db, event.data.object as Stripe.Charge);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook side-effect failed:", err);
    // rollback the idempotency row so the retry can re-process
    await db.from("stripe_webhook_events").delete().eq("event_id", event.id);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(
  db: ReturnType<typeof serviceClient>,
  session: Stripe.Checkout.Session
) {
  const userId = session.metadata?.user_id;
  const courseId = session.metadata?.course_id;
  const courseSlug = session.metadata?.course_slug;
  if (!userId || !courseId) throw new Error("Missing metadata on session");

  const { data: enrolment, error } = await db
    .from("enrollments")
    .upsert(
      {
        user_id: userId,
        course_id: courseId,
        status: "active",
        stripe_checkout_session_id: session.id,
        stripe_customer_id:
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null,
        amount_paid_cents: session.amount_total ?? 0,
      },
      { onConflict: "stripe_checkout_session_id" }
    )
    .select("id")
    .single();

  if (error) throw error;

  // Look up course title + learner profile for the email
  const { data: course } = await db
    .from("courses")
    .select("title")
    .eq("id", courseId)
    .maybeSingle();

  const { data: learner } = await db.auth.admin.getUserById(userId);

  await sendEnrolmentEmail({
    learnerName: (learner?.user?.user_metadata?.full_name as string) ?? null,
    learnerEmail: learner?.user?.email ?? session.customer_details?.email ?? "unknown",
    courseTitle: course?.title ?? courseSlug ?? "(unknown course)",
    amountPaidPence: session.amount_total ?? 0,
    stripeSessionUrl: `https://dashboard.stripe.com/payments/${session.payment_intent}`,
    adminEnrolmentsUrl: "https://sagacitynetwork.net/admin/enrolments",
  });

  return enrolment;
}

async function handleChargeRefunded(
  db: ReturnType<typeof serviceClient>,
  charge: Stripe.Charge
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntentId) return;

  // Find the checkout session for this payment intent
  const stripe = getStripe();
  const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
  const session = sessions.data[0];
  if (!session) return;

  const { error } = await db
    .from("enrollments")
    .update({ status: "refunded" })
    .eq("stripe_checkout_session_id", session.id);
  if (error) throw error;
}
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/academy/stripe", () => {
  const constructEvent = vi.fn();
  return {
    getStripe: () => ({ webhooks: { constructEvent }, checkout: { sessions: { list: vi.fn() } } }),
    getWebhookSecret: () => "whsec_test",
    __constructEvent: constructEvent,
  };
});

const mockDb = {
  from: vi.fn(() => ({
    select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }),
    insert: () => Promise.resolve({ error: null }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
    upsert: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "e1" }, error: null }) }) }),
    update: () => ({ eq: () => Promise.resolve({ error: null }) }),
  })),
  auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: { email: "a@b", user_metadata: {} } } }) } },
};

vi.mock("@supabase/supabase-js", () => ({ createClient: () => mockDb }));
vi.mock("@/lib/emails/academy-enrolment", () => ({ sendEnrolmentEmail: vi.fn() }));

process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost";
process.env.SUPABASE_SERVICE_ROLE_KEY = "service";

function makeReq(body = "{}", sig: string | null = "t=1,v1=abc"): Request {
  const headers = new Headers({ "content-type": "application/json" });
  if (sig !== null) headers.set("stripe-signature", sig);
  return new Request("http://localhost/api/academy/webhook", {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/academy/webhook", () => {
  it("rejects missing signature", async () => {
    const res = await POST(makeReq("{}", null) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
  });

  it("rejects invalid signature", async () => {
    const stripe = await import("@/lib/academy/stripe");
    // @ts-expect-error test hook
    stripe.__constructEvent.mockImplementation(() => { throw new Error("bad sig"); });
    const res = await POST(makeReq("{}") as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- api/academy/webhook
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/academy/webhook
git commit -m "feat(academy): add signature-verified webhook for enrolment and refunds"
```

---

## Task 9: Progress API

**Files:**
- Create: `src/app/api/academy/progress/route.ts`
- Test: `src/app/api/academy/progress/route.test.ts`

- [ ] **Step 1: Write the route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export async function POST(req: NextRequest) {
  if (!isAcademyEnabled()) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { lessonId?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const lessonId = body.lessonId;
  if (!lessonId || typeof lessonId !== "string") {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  // RLS on lessons will refuse the read unless the learner is enrolled
  // (or it's a free preview — but we don't mark previews complete).
  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, module_id, is_free_preview, modules!inner(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    console.error("lesson lookup failed:", lessonError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
  if (!lesson) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  if (lesson.is_free_preview) {
    // Free previews aren't part of the progress model; pretend success.
    return NextResponse.json({ ok: true, skipped: "preview" });
  }

  // Upsert — duplicates silently ignored.
  const { error: upsertError } = await supabase
    .from("lesson_progress")
    .upsert(
      { user_id: user.id, lesson_id: lessonId, completed_at: new Date().toISOString() },
      { onConflict: "user_id,lesson_id" }
    );

  if (upsertError) {
    console.error("progress upsert failed:", upsertError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  // Return updated completion count for the course so the client can update the bar.
  const courseId = Array.isArray(lesson.modules) ? lesson.modules[0]?.course_id : lesson.modules?.course_id;
  const { count } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons!inner(module_id, modules!inner(course_id))", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("lessons.modules.course_id", courseId);

  return NextResponse.json({ ok: true, completedInCourse: count ?? 0 });
}
```

- [ ] **Step 2: Write tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/academy/feature-flag", () => ({ isAcademyEnabled: () => true }));

const mockSupabase = {
  auth: { getUser: vi.fn() },
  from: vi.fn(),
};
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => mockSupabase,
}));

function makeReq(body: unknown) {
  return new Request("http://localhost/api/academy/progress", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/academy/progress", () => {
  beforeEach(() => vi.clearAllMocks());

  it("401s when anonymous", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const res = await POST(makeReq({ lessonId: "l1" }) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(401);
  });

  it("400s when lessonId missing", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const res = await POST(makeReq({}) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
  });

  it("403s when lesson row is not visible (RLS blocked)", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    mockSupabase.from.mockImplementation(() => ({
      select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null, error: null }) }) }),
    }));
    const res = await POST(makeReq({ lessonId: "l1" }) as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(403);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm test -- api/academy/progress
```

Expected: 3 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/academy/progress
git commit -m "feat(academy): add progress API with enrolment guard and idempotent upsert"
```

---

## Task 10: Paid lesson page — server component

**Files:**
- Create: `src/app/(site)/academy/[slug]/learn/[lessonSlug]/page.tsx`

- [ ] **Step 1: Add a `getLessonForLearn` query**

Extend `src/lib/academy/queries.ts` by adding this function at the bottom (keep existing exports):

```ts
export interface LearnLesson {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: Block[];
  duration_minutes: number;
  is_free_preview: boolean;
  position: number;
  course: { id: string; slug: string; title: string };
  module: { id: string; title: string; position: number };
  prevLessonSlug: string | null;
  nextLessonSlug: string | null;
}

/**
 * Returns a lesson only when the signed-in user can read it (RLS enforces).
 * Also computes prev/next lesson slugs within the course, in ordered position.
 */
export async function getLessonForLearn(
  courseSlug: string,
  lessonSlug: string
): Promise<LearnLesson | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id, slug, title, summary, body, duration_minutes, is_free_preview, position, module_id,
      modules!inner (
        id, title, position,
        courses!inner ( id, slug, title, status )
      )
    `
    )
    .eq("slug", lessonSlug)
    .eq("modules.courses.slug", courseSlug)
    .eq("modules.courses.status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const mod = Array.isArray(data.modules) ? data.modules[0] : data.modules;
  const course = Array.isArray(mod.courses) ? mod.courses[0] : mod.courses;

  // Walk all lessons in order to find prev/next
  const { data: allLessons } = await supabase
    .from("lessons")
    .select("slug, position, module_id, modules!inner(position)")
    .eq("modules.courses.slug", courseSlug)
    .order("position", { ascending: true });

  const ordered = (allLessons ?? [])
    .slice()
    .sort((a, b) => {
      const ma = Array.isArray(a.modules) ? a.modules[0] : a.modules;
      const mb = Array.isArray(b.modules) ? b.modules[0] : b.modules;
      if (ma.position !== mb.position) return ma.position - mb.position;
      return a.position - b.position;
    })
    .map((l) => l.slug);

  const idx = ordered.indexOf(lessonSlug);

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? "",
    body: (data.body as Block[]) ?? [],
    duration_minutes: data.duration_minutes ?? 0,
    is_free_preview: data.is_free_preview,
    position: data.position,
    course: { id: course.id, slug: course.slug, title: course.title },
    module: { id: mod.id, title: mod.title, position: mod.position },
    prevLessonSlug: idx > 0 ? ordered[idx - 1] : null,
    nextLessonSlug: idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null,
  };
}
```

- [ ] **Step 2: Write the Learn page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getCourseBySlug, getLessonForLearn } from "@/lib/academy/queries";
import {
  hasActiveEnrolment,
  getCompletedLessonIds,
} from "@/lib/academy/enrollment-queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import BlockRenderer from "@/components/academy/BlockRenderer";
import LessonSidebar from "@/components/academy/LessonSidebar";
import LessonProgressBar from "@/components/academy/LessonProgressBar";
import LessonControls from "./LessonControls";

export const revalidate = 0; // always fresh for enrolled learners

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await getLessonForLearn(slug, lessonSlug);
  if (!lesson) return { title: "Not found", robots: { index: false } };
  return {
    title: `${lesson.title} — ${lesson.course.title} — Sagacity Academy`,
    description: lesson.summary,
    robots: { index: false, follow: false },
  };
}

export default async function LearnLessonPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug, lessonSlug } = await params;

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?redirect=/academy/${slug}/learn/${lessonSlug}`);
  }

  const [lesson, course] = await Promise.all([
    getLessonForLearn(slug, lessonSlug),
    getCourseBySlug(slug),
  ]);
  if (!course) notFound();

  const enrolled = await hasActiveEnrolment(course.id);

  // If the lesson row came back null, it's either not found or RLS-blocked.
  // Either way, send them to the landing page with a gentle banner.
  if (!lesson || (!lesson.is_free_preview && !enrolled)) {
    redirect(`/academy/${slug}?enrol=needed`);
  }

  const completed = await getCompletedLessonIds(course.id);
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completed.size;
  const isCompleted = completed.has(lesson.id);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
      >
        <div className="max-w-site section-px py-6">
          <Link
            href={`/academy/my-learning`}
            className="text-[13px] mb-3 inline-block"
            style={{ color: "var(--color-muted)" }}
          >
            ← My Learning
          </Link>
          <h1
            className="text-[28px] md:text-[36px] font-[800] tracking-heading mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lesson.title}
          </h1>
          <LessonProgressBar completed={completedCount} total={totalLessons} />
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-site section-px">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-12 items-start">
            <LessonSidebar
              courseSlug={course.slug}
              courseTitle={course.title}
              modules={course.modules}
              currentLessonSlug={lesson.slug}
              completedLessonIds={completed}
              isEnrolled={enrolled}
              learnMode={true}
            />
            <article className="max-w-[720px] min-w-0">
              <BlockRenderer blocks={lesson.body} isPreview={false} />
              <LessonControls
                lessonId={lesson.id}
                alreadyCompleted={isCompleted}
                prevHref={lesson.prevLessonSlug ? `/academy/${slug}/learn/${lesson.prevLessonSlug}` : null}
                nextHref={lesson.nextLessonSlug ? `/academy/${slug}/learn/${lesson.nextLessonSlug}` : null}
              />
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npx tsc --noEmit
```

Expected: TS errors about `LessonControls`, `LessonProgressBar`, sidebar new props. That's fine — we add them next. Commit after the next tasks.

---

## Task 11: LessonControls client component

**Files:**
- Create: `src/app/(site)/academy/[slug]/learn/[lessonSlug]/LessonControls.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  lessonId: string;
  alreadyCompleted: boolean;
  prevHref: string | null;
  nextHref: string | null;
}

export default function LessonControls({
  lessonId,
  alreadyCompleted,
  prevHref,
  nextHref,
}: Props) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyCompleted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markComplete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save progress");
        setPending(false);
        return;
      }
      setDone(true);
      setPending(false);
      // refresh server components so sidebar tick and progress bar update
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setPending(false);
    }
  }

  return (
    <div
      className="mt-10 pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {done ? (
        <div
          className="flex items-center gap-2 mb-6 text-[14px] font-[500]"
          style={{ color: "var(--color-accent)" }}
        >
          <CheckCircle2 size={18} />
          Lesson complete
        </div>
      ) : (
        <button
          type="button"
          onClick={markComplete}
          disabled={pending}
          className="mb-6 px-5 py-2.5 text-[14px] font-[500] rounded-[8px] transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--gradient-purple)", color: "#fff" }}
        >
          {pending ? "Saving…" : "Mark as complete"}
        </button>
      )}

      {error ? (
        <p className="text-[12px] mb-4" style={{ color: "#d4443a" }}>
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-2 text-[13px]"
            style={{ color: "var(--color-muted)" }}
          >
            <ArrowLeft size={14} />
            Previous lesson
          </Link>
        ) : <span />}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex items-center gap-2 text-[13px] font-[500]"
            style={{ color: "var(--color-ink)" }}
          >
            Next lesson
            <ArrowRight size={14} />
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
```

---

## Task 12: LessonProgressBar component

**Files:**
- Create: `src/components/academy/LessonProgressBar.tsx`

- [ ] **Step 1: Write the component**

```tsx
interface Props {
  completed: number;
  total: number;
}

export default function LessonProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div>
      <div
        className="flex items-center justify-between text-[12px] mb-1.5"
        style={{ color: "var(--color-muted)" }}
      >
        <span>
          {completed} of {total} lessons complete
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-border)" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "var(--gradient-purple)",
          }}
        />
      </div>
    </div>
  );
}
```

---

## Task 13: Update LessonSidebar for enrolled + completed states

**Files:**
- Modify: `src/components/academy/LessonSidebar.tsx`

- [ ] **Step 1: Extend the props interface**

Change the `Props` interface at the top to:

```tsx
interface Props {
  courseSlug: string;
  courseTitle: string;
  modules: ModuleWithLessons[];
  currentLessonSlug: string;
  completedLessonIds?: Set<string>;
  isEnrolled?: boolean;
  /** When true, lessons link to /learn/<slug> instead of /preview/<slug>. */
  learnMode?: boolean;
}
```

- [ ] **Step 2: Adjust the lesson row logic**

Inside `modules.map(...)` → `m.lessons.map((l) => { ... })`, replace the existing variables with:

```tsx
const isCurrent = l.slug === currentLessonSlug;
const isPreview = l.is_free_preview;
const isCompleted = completedLessonIds?.has(l.id) ?? false;
const unlocked = isEnrolled || isPreview;
const canClick = unlocked && !isCurrent;
const href = learnMode
  ? `/academy/${courseSlug}/learn/${l.slug}`
  : `/academy/${courseSlug}/preview/${l.slug}`;
```

Update the icon block:

```tsx
{isCompleted ? (
  <CheckCircle2 size={14} style={{ color: "var(--color-accent)" }} />
) : isCurrent ? (
  <CheckCircle2 size={14} style={{ color: "var(--color-accent)", opacity: 0.6 }} />
) : unlocked ? (
  <Play size={14} style={{ color: "var(--color-accent)" }} />
) : (
  <Lock size={14} style={{ color: "var(--color-muted)", opacity: 0.5 }} />
)}
```

Update the text color logic:

```tsx
color: isCurrent
  ? "var(--color-accent)"
  : unlocked
    ? "var(--color-ink)"
    : "var(--color-muted)",
```

Update the link target:

```tsx
{canClick ? (
  <Link href={href} ...>
```

- [ ] **Step 3: Remove the "Unlock the full curriculum" bottom strip when enrolled**

Wrap the existing bottom CTA block in `{!isEnrolled ? (<div ...>...</div>) : null}`.

---

## Task 14: QuizBlock interactive mode

**Files:**
- Modify: `src/components/academy/blocks/QuizBlock.tsx`
- Modify: `src/components/academy/BlockRenderer.tsx`

- [ ] **Step 1: Thread `isEnrolled` through BlockRenderer**

In `BlockRenderer.tsx`, change the props to accept `isEnrolled` alongside `isPreview`:

```tsx
interface Props {
  blocks: Block[];
  isPreview: boolean;
  isEnrolled?: boolean;
}

export default function BlockRenderer({ blocks, isPreview, isEnrolled = false }: Props) {
  // ... existing mapping
  // for the quiz case, pass isEnrolled down
  case "quiz":
    return <QuizBlock key={idx} block={b} interactive={isEnrolled} />;
}
```

- [ ] **Step 2: Update QuizBlock to support interactive mode**

Change the component signature to `{ block, interactive = false }`. When `interactive` is true, render a functional form: radio inputs for single-choice, checkboxes for multi, a "Check answers" button that reveals which were correct, and "Reset" to try again. When false, keep the existing locked-preview rendering.

(Implementation is ~60 lines — follow the existing block pattern using `Extract<Block, { type: "quiz" }>`. Use `useState` for selected answers and a `revealed` boolean. Show green tick or red cross next to each option after Check is clicked.)

- [ ] **Step 3: Update the Learn page to pass `isEnrolled`**

In `src/app/(site)/academy/[slug]/learn/[lessonSlug]/page.tsx`, change the BlockRenderer call to:

```tsx
<BlockRenderer blocks={lesson.body} isPreview={false} isEnrolled={enrolled} />
```

- [ ] **Step 4: Commit Tasks 10–14 together**

```bash
git add src/app/\(site\)/academy/\[slug\]/learn src/components/academy/LessonSidebar.tsx src/components/academy/LessonProgressBar.tsx src/components/academy/BlockRenderer.tsx src/components/academy/blocks/QuizBlock.tsx src/lib/academy/queries.ts
git commit -m "feat(academy): paid Learn page with sidebar ticks, progress bar, mark-complete, interactive quizzes"
```

- [ ] **Step 5: Run type check + build**

```bash
npx tsc --noEmit && npm run build
```

Expected: zero errors.

---

## Task 15: My Learning page

**Files:**
- Create: `src/app/(site)/academy/my-learning/page.tsx`
- Create: `src/components/academy/EnrolledCourseCard.tsx`

- [ ] **Step 1: Write the EnrolledCourseCard**

```tsx
import Link from "next/link";
import type { EnrolledCourse } from "@/lib/academy/enrollment-queries";

export default function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const pct = course.total_lessons === 0
    ? 0
    : Math.round((course.completed_lessons / course.total_lessons) * 100);

  const continueHref = course.next_lesson_slug
    ? `/academy/${course.slug}/learn/${course.next_lesson_slug}`
    : `/academy/${course.slug}`;

  return (
    <div
      className="rounded-[12px] overflow-hidden shadow-border"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="h-[160px]"
        style={{
          background: course.hero_image_url
            ? `center/cover no-repeat url(${course.hero_image_url})`
            : "var(--gradient-purple)",
        }}
      />
      <div className="p-5">
        <h3 className="text-[18px] font-[700] mb-1" style={{ fontFamily: "var(--font-display)" }}>
          {course.title}
        </h3>
        <p className="text-[13px] leading-[1.5] mb-4" style={{ color: "var(--color-muted)" }}>
          {course.subtitle}
        </p>

        <div className="flex items-center justify-between text-[12px] mb-1.5" style={{ color: "var(--color-muted)" }}>
          <span>{course.completed_lessons} of {course.total_lessons} lessons</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden mb-5" style={{ background: "var(--color-border)" }}>
          <div className="h-full" style={{ width: `${pct}%`, background: "var(--gradient-purple)" }} />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={continueHref}
            className="flex-1 text-center px-4 py-2.5 text-[13px] font-[500] rounded-[8px]"
            style={{ background: "var(--gradient-purple)", color: "#fff" }}
          >
            {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
          </Link>
          <Link
            href={`/academy/${course.slug}`}
            className="text-[12px]"
            style={{ color: "var(--color-muted)" }}
          >
            View curriculum
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Write the page**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getMyEnrolledCourses } from "@/lib/academy/enrollment-queries";
import EnrolledCourseCard from "@/components/academy/EnrolledCourseCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Learning — Sagacity Academy",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function MyLearningPage({ searchParams }: Props) {
  if (!isAcademyEnabled()) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/academy/my-learning");
  }

  const sp = await searchParams;
  const showWelcome = sp.welcome === "1";

  const courses = await getMyEnrolledCourses();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <section className="py-12 md:py-16" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-site section-px">
          <h1
            className="text-[32px] md:text-[44px] font-[800] tracking-display mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            My Learning
          </h1>
          <p className="text-[15px]" style={{ color: "rgba(240, 236, 244, 0.7)" }}>
            {showWelcome
              ? "Welcome aboard. Pick up where you left off any time."
              : "Pick up where you left off."}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-site section-px">
          {courses.length === 0 ? (
            <div className="max-w-[520px] mx-auto text-center py-10">
              <h2
                className="text-[22px] font-[700] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                You haven&apos;t enrolled in any courses yet
              </h2>
              <p className="text-[14px] mb-6" style={{ color: "var(--color-muted)" }}>
                Browse the catalog and pick something to start learning.
              </p>
              <Link
                href="/academy"
                className="inline-block px-6 py-3 text-[14px] font-[500] rounded-[8px]"
                style={{ background: "var(--gradient-purple)", color: "#fff" }}
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <EnrolledCourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Build check + commit**

```bash
npx tsc --noEmit
git add "src/app/(site)/academy/my-learning" src/components/academy/EnrolledCourseCard.tsx
git commit -m "feat(academy): my-learning dashboard with progress cards and continue-where-you-left-off"
```

---

## Task 16: Nav conditional "My Learning" link

**Files:**
- Modify: `src/components/layout/Nav.tsx`
- Modify: `src/app/(site)/layout.tsx`

- [ ] **Step 1: Add `isSignedIn` prop to Nav**

Change the Nav signature and LINKS array:

```tsx
export default function Nav({
  academyEnabled = false,
  isSignedIn = false,
}: {
  academyEnabled?: boolean;
  isSignedIn?: boolean;
}) {
  const LINKS = [
    { href: "/services", label: "Services" },
    { href: "/work", label: "Work" },
    ...(academyEnabled ? [{ href: "/academy", label: "Academy" }] : []),
    ...(academyEnabled && isSignedIn ? [{ href: "/academy/my-learning", label: "My Learning" }] : []),
    { href: "/training", label: "Training" },
    { href: "/guyana", label: "Guyana" },
    { href: "/about", label: "About" },
  ];
  // rest unchanged
}
```

- [ ] **Step 2: Compute isSignedIn in the site layout**

In `src/app/(site)/layout.tsx`:

```tsx
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const academyEnabled = isAcademyEnabled();

  let isSignedIn = false;
  if (academyEnabled) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    isSignedIn = !!user;
  }

  return (
    <>
      <Nav academyEnabled={academyEnabled} isSignedIn={isSignedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Nav.tsx "src/app/(site)/layout.tsx"
git commit -m "feat(academy): show My Learning in nav for signed-in users"
```

---

## Task 17: Admin enrolments page

**Files:**
- Create: `src/app/admin/(console)/enrolments/page.tsx`
- Create: `src/app/admin/(console)/enrolments/EnrolmentsTable.tsx`
- Modify: `src/app/admin/(console)/layout.tsx` (add nav link)

- [ ] **Step 1: Add a server-side query for admin listing**

Append to `src/lib/academy/enrollment-queries.ts`:

```ts
export interface AdminEnrolmentRow {
  id: string;
  enrolled_at: string;
  status: "active" | "refunded" | "expired";
  amount_paid_cents: number;
  stripe_checkout_session_id: string | null;
  learner_name: string | null;
  learner_email: string;
  course_id: string;
  course_title: string;
  total_lessons: number;
  completed_lessons: number;
}

export interface AdminEnrolmentStats {
  total: number;
  revenueThisMonthPence: number;
  activeLearners: number;
}

/**
 * Admin listing. Uses service role via createClient; RLS bypassed.
 * Caller must enforce admin auth separately (done in the page).
 */
export async function getAdminEnrolments(): Promise<{
  rows: AdminEnrolmentRow[];
  stats: AdminEnrolmentStats;
}> {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase service env vars missing");
  const db = createClient(url, key, { auth: { persistSession: false } });

  const { data: enrols, error } = await db
    .from("enrollments")
    .select(
      `id, enrolled_at, status, amount_paid_cents, stripe_checkout_session_id, user_id,
       courses!inner ( id, title, modules ( lessons ( id ) ) )`
    )
    .order("enrolled_at", { ascending: false });
  if (error) throw error;

  // gather user emails via admin.listUsers — paginated by user ids
  const userIds = Array.from(new Set((enrols ?? []).map((e) => e.user_id)));
  const userMap = new Map<string, { name: string | null; email: string }>();
  for (const id of userIds) {
    const { data } = await db.auth.admin.getUserById(id);
    if (data?.user) {
      userMap.set(id, {
        name: (data.user.user_metadata?.full_name as string) ?? null,
        email: data.user.email ?? "unknown",
      });
    }
  }

  // progress counts per (user, course)
  const { data: progressRows } = await db
    .from("lesson_progress")
    .select("user_id, lesson_id, lessons!inner(module_id, modules!inner(course_id))");
  const progressMap = new Map<string, number>(); // key: user_id|course_id
  for (const row of progressRows ?? []) {
    const courseId = Array.isArray(row.lessons)
      ? row.lessons[0]?.modules?.[0]?.course_id ?? row.lessons[0]?.modules?.course_id
      : row.lessons?.modules?.course_id;
    if (!courseId) continue;
    const k = `${row.user_id}|${courseId}`;
    progressMap.set(k, (progressMap.get(k) ?? 0) + 1);
  }

  const rows: AdminEnrolmentRow[] = (enrols ?? []).map((e) => {
    const totalLessons = (e.courses.modules ?? []).reduce(
      (s, m) => s + (m.lessons?.length ?? 0),
      0
    );
    const u = userMap.get(e.user_id) ?? { name: null, email: "unknown" };
    return {
      id: e.id,
      enrolled_at: e.enrolled_at,
      status: e.status as "active" | "refunded" | "expired",
      amount_paid_cents: e.amount_paid_cents ?? 0,
      stripe_checkout_session_id: e.stripe_checkout_session_id,
      learner_name: u.name,
      learner_email: u.email,
      course_id: e.courses.id,
      course_title: e.courses.title,
      total_lessons: totalLessons,
      completed_lessons: progressMap.get(`${e.user_id}|${e.courses.id}`) ?? 0,
    };
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const stats: AdminEnrolmentStats = {
    total: rows.length,
    revenueThisMonthPence: rows
      .filter((r) => r.status === "active" && r.enrolled_at >= monthStart)
      .reduce((s, r) => s + r.amount_paid_cents, 0),
    activeLearners: new Set(rows.filter((r) => r.status === "active").map((r) => r.learner_email))
      .size,
  };

  return { rows, stats };
}
```

- [ ] **Step 2: Write the server page**

```tsx
import type { Metadata } from "next";
import { getAdminEnrolments } from "@/lib/academy/enrollment-queries";
import EnrolmentsTable from "./EnrolmentsTable";
import RefreshButton from "@/components/admin/RefreshButton"; // assumes existing pattern

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Enrolments — Admin" };

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminEnrolmentsPage() {
  const { rows, stats } = await getAdminEnrolments();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-[700]">Enrolments</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total enrolments" value={stats.total.toString()} />
        <StatCard label="Revenue this month" value={formatPence(stats.revenueThisMonthPence)} />
        <StatCard label="Active learners" value={stats.activeLearners.toString()} />
      </div>

      <EnrolmentsTable rows={rows} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5 rounded-[10px] shadow-border" style={{ background: "var(--surface-0)" }}>
      <div className="text-[11px] tracking-[0.12em] uppercase mb-1" style={{ color: "var(--color-muted)" }}>
        {label}
      </div>
      <div className="text-[24px] font-[700]">{value}</div>
    </div>
  );
}
```

(If `RefreshButton` lives at a different path, grep for it in the existing admin pages — it exists, I saw it referenced in the leads/queue/contacts admin pages.)

- [ ] **Step 3: Write the client table**

```tsx
"use client";

import { useState, useMemo } from "react";
import type { AdminEnrolmentRow } from "@/lib/academy/enrollment-queries";

export default function EnrolmentsTable({ rows }: { rows: AdminEnrolmentRow[] }) {
  const [course, setCourse] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "active" | "refunded">("all");
  const [dateRange, setDateRange] = useState<"month" | "30d" | "all">("all");

  const courses = useMemo(
    () => Array.from(new Map(rows.map((r) => [r.course_id, r.course_title])).entries()),
    [rows]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => {
      if (course !== "all" && r.course_id !== course) return false;
      if (status !== "all" && r.status !== status) return false;
      const rowTime = new Date(r.enrolled_at).getTime();
      if (dateRange === "month") {
        const d = new Date();
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        if (rowTime < monthStart) return false;
      } else if (dateRange === "30d") {
        if (now - rowTime > 30 * 24 * 3600 * 1000) return false;
      }
      return true;
    });
  }, [rows, course, status, dateRange]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={course} onChange={(e) => setCourse(e.target.value)} className="px-3 py-2 rounded-[8px] border">
          <option value="all">All courses</option>
          {courses.map(([id, title]) => <option key={id} value={id}>{title}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="px-3 py-2 rounded-[8px] border">
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)} className="px-3 py-2 rounded-[8px] border">
          <option value="all">All time</option>
          <option value="month">This month</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-[10px] shadow-border" style={{ background: "var(--surface-0)" }}>
        <table className="min-w-[900px] w-full text-[13px]">
          <thead>
            <tr className="text-left" style={{ color: "var(--color-muted)" }}>
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                <td className="px-4 py-3">
                  <div>{r.learner_name ?? r.learner_email}</div>
                  <div className="text-[11px]" style={{ color: "var(--color-muted)" }}>{r.learner_email}</div>
                </td>
                <td className="px-4 py-3">{r.course_title}</td>
                <td className="px-4 py-3">{new Date(r.enrolled_at).toLocaleDateString("en-GB")}</td>
                <td className="px-4 py-3">£{(r.amount_paid_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-[600] uppercase tracking-[0.04em]"
                    style={{
                      background: r.status === "active" ? "rgba(66, 160, 80, 0.15)" : "rgba(200,200,200,0.15)",
                      color: r.status === "active" ? "#42a050" : "var(--color-muted)",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">{r.completed_lessons} of {r.total_lessons}</td>
                <td className="px-4 py-3">
                  {r.stripe_checkout_session_id ? (
                    <a
                      href={`https://dashboard.stripe.com/payments?search=${encodeURIComponent(r.stripe_checkout_session_id)}`}
                      target="_blank"
                      rel="noopener"
                      className="text-[12px] underline"
                    >
                      View
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-10 text-[13px]" style={{ color: "var(--color-muted)" }}>
          No enrolments match these filters.
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Add the admin sidebar link**

In `src/app/admin/(console)/layout.tsx`, find the sidebar nav and add an entry for "Enrolments" pointing at `/admin/enrolments`. Follow the existing pattern of `Leads`, `Queue`, `Templates`, `Contacts`.

- [ ] **Step 5: Build check + commit**

```bash
npx tsc --noEmit && npm run build
git add "src/app/admin/(console)/enrolments" "src/app/admin/(console)/layout.tsx" src/lib/academy/enrollment-queries.ts
git commit -m "feat(academy): admin enrolments page with stats, filters, and Stripe links"
```

---

## Task 18: Vercel env vars + Stripe webhook endpoint setup

**Files:** none (manual configuration by Denise)

- [ ] **Step 1: Document what Denise must set**

Leave this as a message to the user after merge. The env vars to set in **Vercel → sagacity-network → Settings → Environment Variables** for both Preview AND Production scopes:

| Name | Value | Where to get it |
|---|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_...` (preview) / `sk_live_...` (prod) | Already set for Guyana — reuse |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe dashboard → Developers → Webhooks → (create new endpoint for `/api/academy/webhook`) |

And in **Stripe dashboard → Developers → Webhooks → Add endpoint**:
- URL: `https://<preview-or-prod-url>/api/academy/webhook`
- Events to listen for: `checkout.session.completed`, `charge.refunded`

---

## Task 19: End-to-end smoke test on Vercel preview

**Files:** none

- [ ] **Step 1: Push branch, convert PR to ready-for-review**

```bash
git push
gh pr ready
```

Wait for preview deploy to go READY (use Vercel MCP to check).

- [ ] **Step 2: Manual test with Stripe test card**

On the preview URL:

1. Sign out (or use a fresh browser profile).
2. Visit `/academy/ai-for-small-business` → click **Enrol** → should redirect to `/login?redirect=...`.
3. Sign in via magic link. After redirect, click **Enrol** again.
4. Stripe Checkout loads. Use test card `4242 4242 4242 4242`, any future expiry, any CVC, any postcode.
5. Pay. Should land on `/academy/my-learning?welcome=1` with welcome message and the course card visible.
6. Click **Start** on the card → lands on the first lesson under `/learn/...`.
7. Sidebar should now show locks removed, current lesson highlighted, other lessons as play icons.
8. Read the lesson. Click **Mark as complete**. Sidebar tick should appear, progress bar should advance, button should flip to "Lesson complete".
9. Click **Next lesson**. Second lesson loads.
10. Check inbox for `denise@sagacitynetwork.net` — should see a "New Academy enrolment" email.
11. In Stripe dashboard → Payments → find the test payment → **Refund**.
12. Within ~5 seconds, refresh the preview's learn page → should redirect to `/academy/ai-for-small-business?enrol=needed`. Sidebar back to locked.
13. Visit `/admin/enrolments` → the row should show status **Refunded**.

- [ ] **Step 3: If all 13 steps pass, mark PR ready and request review**

```bash
gh pr comment <pr-number> --body "Manual E2E smoke passed. Ready for review and merge."
```

- [ ] **Step 4: Finish the development branch**

Invoke the `superpowers:finishing-a-development-branch` skill to merge and clean up.

---

## Verification summary

**Automated gates (run in CI / locally before merge):**

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

All must pass.

**Supabase advisor check:**

Run `get_advisors` with type `security` post-migration. No new warnings introduced.

**Manual smoke test:**

Task 19 above. All 13 steps must pass on the Vercel preview before merge.

---

## Out of scope (for future slices, do NOT implement here)

- Certificates of completion
- Graded / stored quiz attempts
- Course bundles or discount codes
- Subscription / membership pricing
- VAT handling
- Learner community features
- Course comments / Q&A
- Mobile app / offline viewing
- Refund-initiation from the admin page (Stripe dashboard only)
- Per-learner admin detail page (aggregate list is enough)
