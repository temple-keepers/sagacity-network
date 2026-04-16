# Academy Slice 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Academy's foundational infrastructure — database schema (8 tables with RLS), Supabase Auth magic-link flow, Zod block schemas, feature flag, and `/login` page — without exposing any user-facing changes. Nothing is publicly visible after this slice, but everything needed for Slice 2 (public catalog) and beyond is in place.

**Architecture:** Supabase-native JSONB content model. Magic-link auth via `@supabase/ssr` (Next 16 App Router pattern). Feature flag `ACADEMY_ENABLED` gates all `/academy` routes so unreleased work can merge to `main` safely. Zod is the single source of truth for content shape, shared between seed script, block editor, server actions, and renderer.

**Tech Stack:** Next 16.2.3 App Router + Turbopack, Supabase (Postgres + Auth + Storage), `@supabase/ssr` for session cookies, Zod for validation, Vitest for unit tests, Resend for auth emails.

**Spec reference:** `docs/superpowers/specs/2026-04-16-academy-design.md` (sections 4, 5, 6, 7, 10-Slice-1, 13).

---

## File structure for this slice

**New files:**

```
src/lib/academy/
├── schema.ts                     # Zod schemas for Block[] + Course JSON
├── schema.test.ts                # Round-trip tests for every block type
└── feature-flag.ts               # Reads ACADEMY_ENABLED env, single call site

src/lib/supabase/
├── server.ts                     # createSupabaseServerClient() — cookies() aware
├── client.ts                     # createSupabaseBrowserClient() — for client comps
└── middleware.ts                 # updateSession() — refreshes auth cookie

src/middleware.ts                 # Root Next middleware, calls updateSession()

src/app/login/
├── page.tsx                      # Magic-link request form
└── LoginForm.tsx                 # Client comp (useActionState)

src/app/auth/callback/
└── route.ts                      # Handles magic-link code exchange

src/app/api/auth/
└── sign-out/route.ts             # POST → signOut() → redirect

supabase/migrations/
└── 20260416000000_academy_foundation.sql   # All 8 tables + RLS

scripts/
└── seed-academy-admin.ts         # Grants Denise the "admin" role

vitest.config.ts                  # Test runner config
```

**Modified files:**

```
package.json                      # Add @supabase/ssr, zod, nanoid, vitest deps + scripts
src/app/layout.tsx                # ACADEMY_ENABLED gate at root
```

Each file has one responsibility. `schema.ts` defines shape; `feature-flag.ts` reads env; Supabase helpers are split by execution environment (server vs client vs middleware). No file does two jobs.

---

## Task 1: Dependencies and test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Install runtime deps**

Run:
```
npm install @supabase/ssr@^0.7.0 zod@^4.0.0 nanoid@^5.1.0
```

Expected: `package.json` now has `@supabase/ssr`, `zod`, `nanoid` in `dependencies`.

- [ ] **Step 2: Install dev deps**

Run:
```
npm install -D vitest@^3.0.0 @vitest/ui@^3.0.0
```

Expected: `vitest` and `@vitest/ui` appear in `devDependencies`.

- [ ] **Step 3: Add test scripts**

Edit `package.json` scripts block to:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 4: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 5: Verify test runner works**

Run:
```
npm test
```

Expected: exits 0 with "No test files found" (since we haven't written any yet).

- [ ] **Step 6: Commit**

```
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: add @supabase/ssr, zod, nanoid, vitest for academy slice 1"
```

---

## Task 2: Zod schema for content blocks

**Files:**
- Create: `src/lib/academy/schema.ts`
- Test: `src/lib/academy/schema.test.ts`

- [ ] **Step 1: Write the failing tests first**

Create `src/lib/academy/schema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { BlockSchema, BlockArraySchema, CourseSeedSchema } from "./schema";

describe("BlockSchema — round-trip every block type", () => {
  it("parses a heading block", () => {
    const input = { id: "h1", type: "heading", level: 2, text: "Foundations" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a text block", () => {
    const input = { id: "t1", type: "text", markdown: "Hello **world**." };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses an image block with alt text", () => {
    const input = {
      id: "i1",
      type: "image",
      url: "https://example.com/a.png",
      alt: "Diagram",
      caption: "A diagram",
      width: 800,
      height: 600,
    };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a video block with vimeo provider", () => {
    const input = { id: "v1", type: "video", provider: "vimeo", vimeoId: "123456789", durationSeconds: 540 };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a callout block", () => {
    const input = { id: "c1", type: "callout", variant: "tip", title: "Try this", markdown: "Step 1..." };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a download block", () => {
    const input = { id: "d1", type: "download", label: "Worksheet", url: "https://x.com/a.pdf", fileSize: "1.2 MB", fileType: "pdf" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a code block", () => {
    const input = { id: "co1", type: "code", language: "python", code: "print('hi')" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a quiz block with single-choice question", () => {
    const input = {
      id: "q1",
      type: "quiz",
      prompt: "Test your knowledge",
      passingScore: 0.7,
      questions: [
        {
          id: "qq1",
          type: "single-choice",
          question: "What is 2+2?",
          options: [
            { id: "a", text: "3" },
            { id: "b", text: "4" },
          ],
          correctIds: ["b"],
          explanation: "Basic arithmetic.",
        },
      ],
    };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses a divider block", () => {
    const input = { id: "dv1", type: "divider" };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("parses an embed block", () => {
    const input = { id: "e1", type: "embed", provider: "loom", url: "https://loom.com/share/abc", height: 480 };
    expect(BlockSchema.parse(input)).toEqual(input);
  });

  it("rejects an unknown block type", () => {
    expect(() => BlockSchema.parse({ id: "x", type: "unknown-type" })).toThrow();
  });

  it("rejects a heading with invalid level", () => {
    expect(() => BlockSchema.parse({ id: "h", type: "heading", level: 5, text: "Too deep" })).toThrow();
  });

  it("rejects a quiz block with empty questions", () => {
    expect(() =>
      BlockSchema.parse({ id: "q", type: "quiz", prompt: "Empty", questions: [] })
    ).toThrow();
  });

  it("rejects a block missing an id", () => {
    expect(() => BlockSchema.parse({ type: "text", markdown: "No id" })).toThrow();
  });
});

describe("BlockArraySchema", () => {
  it("accepts an array of mixed block types", () => {
    const blocks = [
      { id: "h1", type: "heading", level: 2, text: "Intro" },
      { id: "t1", type: "text", markdown: "Body." },
      { id: "d1", type: "divider" },
    ];
    expect(BlockArraySchema.parse(blocks)).toEqual(blocks);
  });

  it("accepts an empty array", () => {
    expect(BlockArraySchema.parse([])).toEqual([]);
  });

  it("rejects if any block is invalid", () => {
    expect(() =>
      BlockArraySchema.parse([
        { id: "h1", type: "heading", level: 2, text: "OK" },
        { id: "bad", type: "invalid" },
      ])
    ).toThrow();
  });
});

describe("CourseSeedSchema", () => {
  it("parses a minimal course seed", () => {
    const seed = {
      course: {
        slug: "test-course",
        title: "Test",
        subtitle: "A test",
        description: "Long description.",
        price_cents: 14900,
        level: "beginner",
        instructor_name: "Denise Isaac",
      },
      modules: [
        {
          title: "Module 1",
          summary: "First module",
          position: 0,
          lessons: [
            {
              slug: "welcome",
              title: "Welcome",
              summary: "First lesson",
              duration_minutes: 5,
              is_free_preview: true,
              position: 0,
              body: [{ id: "h1", type: "heading", level: 2, text: "Hi" }],
            },
          ],
        },
      ],
    };
    expect(CourseSeedSchema.parse(seed)).toEqual(seed);
  });

  it("rejects a course with no modules", () => {
    const seed = {
      course: { slug: "t", title: "T", subtitle: "s", description: "d", price_cents: 0, level: "beginner", instructor_name: "D" },
      modules: [],
    };
    expect(() => CourseSeedSchema.parse(seed)).toThrow();
  });

  it("rejects an invalid level", () => {
    const seed = {
      course: { slug: "t", title: "T", subtitle: "s", description: "d", price_cents: 0, level: "expert", instructor_name: "D" },
      modules: [{ title: "M", summary: "s", position: 0, lessons: [] }],
    };
    expect(() => CourseSeedSchema.parse(seed)).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they all fail**

Run:
```
npm test
```

Expected: all tests fail with "Cannot find module './schema'".

- [ ] **Step 3: Write the schema file**

Create `src/lib/academy/schema.ts`:

```ts
import { z } from "zod";

// ─ Individual block schemas ──────────────────────────────────────

const HeadingBlock = z.object({
  id: z.string().min(1),
  type: z.literal("heading"),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string(),
});

const TextBlock = z.object({
  id: z.string().min(1),
  type: z.literal("text"),
  markdown: z.string(),
});

const ImageBlock = z.object({
  id: z.string().min(1),
  type: z.literal("image"),
  url: z.string().url(),
  alt: z.string(),
  caption: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

const VideoBlock = z.object({
  id: z.string().min(1),
  type: z.literal("video"),
  provider: z.literal("vimeo"),
  vimeoId: z.string().min(1),
  title: z.string().optional(),
  durationSeconds: z.number().int().nonnegative().optional(),
});

const CalloutBlock = z.object({
  id: z.string().min(1),
  type: z.literal("callout"),
  variant: z.enum(["info", "warning", "success", "tip"]),
  title: z.string().optional(),
  markdown: z.string(),
});

const DownloadBlock = z.object({
  id: z.string().min(1),
  type: z.literal("download"),
  label: z.string(),
  url: z.string().url(),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
});

const CodeBlock = z.object({
  id: z.string().min(1),
  type: z.literal("code"),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
});

const QuizQuestion = z.object({
  id: z.string().min(1),
  type: z.enum(["single-choice", "multi-choice", "true-false"]),
  question: z.string(),
  options: z.array(z.object({ id: z.string().min(1), text: z.string() })).min(2),
  correctIds: z.array(z.string()).min(1),
  explanation: z.string().optional(),
});

const QuizBlock = z.object({
  id: z.string().min(1),
  type: z.literal("quiz"),
  prompt: z.string(),
  questions: z.array(QuizQuestion).min(1),
  passingScore: z.number().min(0).max(1).optional(),
  feedback: z
    .object({
      correct: z.string(),
      incorrect: z.string(),
    })
    .optional(),
});

const DividerBlock = z.object({
  id: z.string().min(1),
  type: z.literal("divider"),
});

const EmbedBlock = z.object({
  id: z.string().min(1),
  type: z.literal("embed"),
  provider: z.enum(["loom", "figma", "codesandbox", "generic-iframe"]),
  url: z.string().url(),
  height: z.number().int().positive().optional(),
});

// ─ Unified block + array ─────────────────────────────────────────

export const BlockSchema = z.discriminatedUnion("type", [
  HeadingBlock,
  TextBlock,
  ImageBlock,
  VideoBlock,
  CalloutBlock,
  DownloadBlock,
  CodeBlock,
  QuizBlock,
  DividerBlock,
  EmbedBlock,
]);

export const BlockArraySchema = z.array(BlockSchema);

export type Block = z.infer<typeof BlockSchema>;

// ─ Course seed schema (for seed script + AI generation contract) ─

const LessonSeed = z.object({
  slug: z.string().min(1),
  title: z.string(),
  summary: z.string(),
  duration_minutes: z.number().int().nonnegative(),
  is_free_preview: z.boolean(),
  position: z.number().int().nonnegative(),
  body: BlockArraySchema,
});

const ModuleSeed = z.object({
  title: z.string(),
  summary: z.string(),
  position: z.number().int().nonnegative(),
  lessons: z.array(LessonSeed),
});

export const CourseSeedSchema = z.object({
  course: z.object({
    slug: z.string().min(1),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    hero_image_url: z.string().url().optional(),
    price_cents: z.number().int().nonnegative(),
    stripe_price_id: z.string().optional(),
    level: z.enum(["beginner", "intermediate", "advanced"]),
    instructor_name: z.string(),
    instructor_bio: z.string().optional(),
  }),
  modules: z.array(ModuleSeed).min(1),
});

export type CourseSeed = z.infer<typeof CourseSeedSchema>;
```

- [ ] **Step 4: Run tests to verify they all pass**

Run:
```
npm test
```

Expected: all 20+ tests pass.

- [ ] **Step 5: Run type-check and lint**

Run:
```
npx tsc --noEmit && npm run lint
```

Expected: both exit 0 with no errors.

- [ ] **Step 6: Commit**

```
git add src/lib/academy/schema.ts src/lib/academy/schema.test.ts
git commit -m "feat(academy): add Zod block schemas with round-trip tests"
```

---

## Task 3: Feature flag module

**Files:**
- Create: `src/lib/academy/feature-flag.ts`
- Modify: `.env.example` (if present — otherwise document in a comment)

- [ ] **Step 1: Create feature flag module**

Create `src/lib/academy/feature-flag.ts`:

```ts
/**
 * Academy feature flag.
 *
 * Set `ACADEMY_ENABLED=true` in env to expose /academy and /login routes.
 * When false (default), /academy/* returns 404 and /login redirects to /.
 *
 * This exists so unreleased Academy code can merge to main without leaking
 * to production users.
 */
export function isAcademyEnabled(): boolean {
  return process.env.ACADEMY_ENABLED === "true";
}
```

- [ ] **Step 2: Document the env var**

If `.env.example` exists, add the line. If not, skip this step (we'll add it when we document env vars more fully in Slice 3).

- [ ] **Step 3: Type-check**

Run:
```
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 4: Commit**

```
git add src/lib/academy/feature-flag.ts
git commit -m "feat(academy): add ACADEMY_ENABLED feature flag"
```

---

## Task 4: Database migration — 8 tables with RLS

**Files:**
- Create: `supabase/migrations/20260416000000_academy_foundation.sql`

The migration runs via Supabase MCP `apply_migration` once written. All tables are additive; no existing tables are touched.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/20260416000000_academy_foundation.sql`:

```sql
-- Academy Slice 1 — Foundation
-- Additive migration: 8 new tables + RLS policies.
-- Inverse (documented, not automated):
--   drop table if exists academy_audit_log, quiz_attempts, lesson_progress, enrollments,
--     lessons, modules, courses, user_roles cascade;

-- ─ 1. user_roles ──────────────────────────────────────────────────

create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'admin', 'client')),
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

-- Service role only — no client policies needed
create policy "user_roles service-only" on public.user_roles
  for all
  to service_role
  using (true)
  with check (true);

-- ─ 2. courses ─────────────────────────────────────────────────────

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text not null,
  description text not null,
  hero_image_url text,
  price_cents integer not null default 0,
  stripe_price_id text,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  duration_minutes integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  instructor_name text not null,
  instructor_bio text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index courses_status_idx on public.courses(status);
create index courses_slug_idx on public.courses(slug);

alter table public.courses enable row level security;

create policy "courses public read published" on public.courses
  for select
  to anon, authenticated
  using (status = 'published');

create policy "courses admin all" on public.courses
  for all
  to service_role
  using (true)
  with check (true);

-- ─ 3. modules ─────────────────────────────────────────────────────

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  summary text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index modules_course_idx on public.modules(course_id, position);

alter table public.modules enable row level security;

create policy "modules public read via published course" on public.modules
  for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.status = 'published'
    )
  );

create policy "modules admin all" on public.modules
  for all
  to service_role
  using (true)
  with check (true);

-- ─ 4. lessons ─────────────────────────────────────────────────────

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '[]'::jsonb,
  duration_minutes integer not null default 0,
  is_free_preview boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (module_id, slug)
);

create index lessons_module_idx on public.lessons(module_id, position);
create index lessons_preview_idx on public.lessons(is_free_preview) where is_free_preview = true;

alter table public.lessons enable row level security;

-- Free previews: anyone can read
create policy "lessons public read free preview" on public.lessons
  for select
  to anon, authenticated
  using (
    is_free_preview = true
    and exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.status = 'published'
    )
  );

-- Paid lessons: only enrolled users can read
create policy "lessons enrolled read" on public.lessons
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = lessons.module_id
        and e.user_id = auth.uid()
    )
  );

create policy "lessons admin all" on public.lessons
  for all
  to service_role
  using (true)
  with check (true);

-- ─ 5. enrollments ─────────────────────────────────────────────────

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source text not null check (source in ('stripe', 'manual', 'comp')),
  stripe_session_id text unique,
  granted_by uuid references auth.users(id) on delete set null,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index enrollments_user_idx on public.enrollments(user_id);

alter table public.enrollments enable row level security;

create policy "enrollments user read own" on public.enrollments
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "enrollments service-only write" on public.enrollments
  for all
  to service_role
  using (true)
  with check (true);

-- ─ 6. lesson_progress ─────────────────────────────────────────────

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index lesson_progress_user_idx on public.lesson_progress(user_id, last_viewed_at desc);

alter table public.lesson_progress enable row level security;

create policy "lesson_progress user rw own" on public.lesson_progress
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─ 7. quiz_attempts ───────────────────────────────────────────────

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  block_id text not null,
  answers jsonb not null,
  score numeric(4, 3) not null check (score >= 0 and score <= 1),
  attempted_at timestamptz not null default now()
);

create index quiz_attempts_user_lesson_idx on public.quiz_attempts(user_id, lesson_id);

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts user rw own" on public.quiz_attempts
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─ 8. academy_audit_log ───────────────────────────────────────────

create table public.academy_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  subject_type text not null,
  subject_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index academy_audit_log_created_idx on public.academy_audit_log(created_at desc);
create index academy_audit_log_subject_idx on public.academy_audit_log(subject_type, subject_id);

alter table public.academy_audit_log enable row level security;

create policy "academy_audit_log service-only" on public.academy_audit_log
  for all
  to service_role
  using (true)
  with check (true);

-- ─ updated_at trigger for courses ─────────────────────────────────

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Call the Supabase MCP tool `mcp__353fb150-2343-4eea-9fa9-b2e7986afef0__apply_migration` with:
- `name`: `academy_foundation`
- `query`: the full SQL above

Expected: migration runs successfully. If it fails because of an existing table or policy, STOP and inspect — do not drop anything without explicit approval.

- [ ] **Step 3: Verify tables exist**

Call `mcp__353fb150-2343-4eea-9fa9-b2e7986afef0__list_tables` with `schemas: ["public"]`.

Expected: the list includes `user_roles`, `courses`, `modules`, `lessons`, `enrollments`, `lesson_progress`, `quiz_attempts`, `academy_audit_log` in addition to the existing tables.

- [ ] **Step 4: Verify RLS is enabled**

Call `mcp__353fb150-2343-4eea-9fa9-b2e7986afef0__execute_sql` with:

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('courses', 'modules', 'lessons', 'enrollments', 'lesson_progress', 'quiz_attempts', 'user_roles', 'academy_audit_log');
```

Expected: all 8 tables show `rowsecurity = true`.

- [ ] **Step 5: Commit the migration file**

```
git add supabase/migrations/20260416000000_academy_foundation.sql
git commit -m "feat(academy): add foundation migration — 8 tables + RLS"
```

---

## Task 5: Supabase SSR helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/middleware.ts`

Follow the official `@supabase/ssr` Next.js App Router pattern (docs: https://supabase.com/docs/guides/auth/server-side/nextjs).

- [ ] **Step 1: Server helper**

Create `src/lib/supabase/server.ts`:

```ts
import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components and Route Handlers.
 * Reads session from Next's cookie store; writes are no-ops here
 * (writes happen in middleware.ts and Route Handlers separately).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Called from a Server Component — safe to ignore; middleware will refresh.
      }
    },
  };

  return createServerClient(url, anonKey, { cookies: cookieMethods });
}
```

- [ ] **Step 2: Client helper**

Create `src/lib/supabase/client.ts`:

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components.
 * Uses the browser cookie jar automatically.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(url, anonKey);
}
```

- [ ] **Step 3: Middleware session refresher**

Create `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every matched request.
 * Must be called from root middleware.ts BEFORE any auth-dependent checks.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Triggers a refresh if the access token is stale.
  await supabase.auth.getUser();

  return response;
}
```

- [ ] **Step 4: Type-check**

Run:
```
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 5: Commit**

```
git add src/lib/supabase/
git commit -m "feat(academy): add @supabase/ssr server, client, and middleware helpers"
```

---

## Task 6: Root middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Write the middleware**

Create `src/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

/**
 * Root middleware. Two jobs:
 *   1. Refresh the Supabase session cookie on every matched request.
 *   2. Gate /academy and /login behind the ACADEMY_ENABLED flag.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Feature-flag gate
  if (!isAcademyEnabled()) {
    if (pathname.startsWith("/academy") || pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals + static files, but DO match root + all pages/API
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
```

- [ ] **Step 2: Type-check**

Run:
```
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Manual sanity check with dev server**

Run:
```
npm run dev
```

In a new terminal, confirm:
- `curl -I http://localhost:3000/` → 200 (root still loads)
- `curl -I http://localhost:3000/academy` → 307 redirect to `/` (flag is off)
- `curl -I http://localhost:3000/login` → 307 redirect to `/` (flag is off)

Stop the dev server after checking.

- [ ] **Step 4: Commit**

```
git add src/middleware.ts
git commit -m "feat(academy): add root middleware with session refresh + feature flag gate"
```

---

## Task 7: Login page (magic-link request form)

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/LoginForm.tsx`
- Create: `src/app/login/actions.ts`

- [ ] **Step 1: Server action to send magic link**

Create `src/app/login/actions.ts`:

```ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

type State = { ok?: boolean; error?: string } | null;

export async function requestMagicLink(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const redirectPath = String(formData.get("redirect") ?? "/academy/my-learning");

  if (!email || !/.+@.+\..+/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const h = await headers();
  const origin = h.get("origin") ?? h.get("x-forwarded-host") ?? "http://localhost:3000";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[login] magic link send failed:", error);
    return { error: "Couldn't send the login link. Please try again." };
  }

  return { ok: true };
}
```

- [ ] **Step 2: Client form**

Create `src/app/login/LoginForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { requestMagicLink } from "./actions";

export default function LoginForm({ redirect }: { redirect: string }) {
  const [state, formAction, pending] = useActionState(requestMagicLink, null);

  if (state?.ok) {
    return (
      <div
        className="w-full max-w-sm p-8 rounded-2xl text-center"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Check your inbox
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          We&rsquo;ve sent you a login link. Click it to continue to your Academy.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full max-w-sm p-8 rounded-2xl"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        Sign in
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
        We&rsquo;ll email you a one-click login link.
      </p>

      {state?.error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}
        >
          {state.error}
        </div>
      )}

      <input type="hidden" name="redirect" value={redirect} />

      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: "var(--color-muted)" }}
      >
        Email
      </label>
      <input
        type="email"
        name="email"
        autoFocus
        required
        className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none focus:ring-2"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-ink)",
        }}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
        style={{ background: "var(--gradient-purple)" }}
      >
        {pending ? "Sending..." : "Send me a login link"}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Page shell**

Create `src/app/login/page.tsx`:

```tsx
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Sagacity Network",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect ?? "/academy/my-learning";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-hero)" }}
    >
      <LoginForm redirect={redirect} />
    </div>
  );
}
```

- [ ] **Step 4: Type-check + lint**

Run:
```
npx tsc --noEmit && npm run lint
```

Expected: both exit 0.

- [ ] **Step 5: Commit**

```
git add src/app/login/
git commit -m "feat(academy): add /login page with magic-link request form"
```

---

## Task 8: Magic-link callback handler

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Write the callback route**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase magic-link callback.
 *
 * Supabase sends the user here with either:
 *   - ?code=... (PKCE flow, current default)
 *   - #access_token=... (legacy hash fragment, not handled here)
 *
 * On success we redirect to ?next=/path (sanitized to prevent open-redirect).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange failed:", error);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

/**
 * Allow only same-origin paths starting with "/" and not "//".
 * This blocks ?next=https://evil.com redirects.
 */
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/academy/my-learning";
  if (!raw.startsWith("/")) return "/academy/my-learning";
  if (raw.startsWith("//")) return "/academy/my-learning";
  return raw;
}
```

- [ ] **Step 2: Type-check**

Run:
```
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```
git add src/app/auth/callback/
git commit -m "feat(academy): add auth callback for magic-link code exchange"
```

---

## Task 9: Sign-out API route

**Files:**
- Create: `src/app/api/auth/sign-out/route.ts`

- [ ] **Step 1: Write the sign-out route**

Create `src/app/api/auth/sign-out/route.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/`, { status: 303 });
}
```

- [ ] **Step 2: Type-check**

Run:
```
npx tsc --noEmit
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```
git add src/app/api/auth/sign-out/
git commit -m "feat(academy): add POST /api/auth/sign-out handler"
```

---

## Task 10: Grant Denise the admin role

**Files:**
- Create: `scripts/seed-academy-admin.ts`

This is a one-shot idempotent script. It looks up Denise's Supabase user by email and inserts `(user_id, 'admin')` into `user_roles` if missing.

- [ ] **Step 1: Write the script**

Create `scripts/seed-academy-admin.ts`:

```ts
/**
 * Grants the "admin" role to a Supabase user identified by email.
 *
 * Usage:
 *   npx tsx scripts/seed-academy-admin.ts denise@sagacitynetwork.net
 *
 * The user must already exist in auth.users. If they don't, sign in once
 * via /login to create the account, then re-run this script.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/seed-academy-admin.ts <email>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Look up user by email via Admin API
  const { data: usersData, error: lookupError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (lookupError) throw lookupError;

  const user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(
      `No auth.users row found for ${email}. Sign in once via /login with this email, then re-run.`
    );
    process.exit(1);
  }

  // Upsert role (primary key on (user_id, role) makes this idempotent)
  const { error: upsertError } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

  if (upsertError) throw upsertError;

  console.log(`✓ ${email} (${user.id}) granted "admin" role.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Install tsx for running TS scripts**

Run:
```
npm install -D tsx@^4.0.0 dotenv@^17.0.0
```

Expected: `tsx` and `dotenv` appear in `devDependencies`.

- [ ] **Step 3: Add a package.json script**

Edit `package.json` scripts to add:

```json
"seed:academy-admin": "tsx scripts/seed-academy-admin.ts"
```

Full scripts block should now read:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:ui": "vitest --ui",
  "seed:academy-admin": "tsx scripts/seed-academy-admin.ts"
}
```

- [ ] **Step 4: Do not run the script yet**

Denise must sign in via `/login` once to create her `auth.users` row before this script can find her. That happens in the manual verification task below.

- [ ] **Step 5: Commit**

```
git add scripts/seed-academy-admin.ts package.json package-lock.json
git commit -m "feat(academy): add admin-role seed script"
```

---

## Task 11: Full verification + deploy preparation

- [ ] **Step 1: Run the full quality gate**

Run each in order:
```
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Expected: all four exit 0. Build should emit "Compiled successfully" with the new `/login`, `/auth/callback`, `/api/auth/sign-out` routes listed.

- [ ] **Step 2: Set the feature flag in local env**

Edit `.env.local` and add:

```
ACADEMY_ENABLED=true
```

(Do NOT commit `.env.local`.)

- [ ] **Step 3: Start the dev server**

Run:
```
npm run dev
```

- [ ] **Step 4: Manually verify /login renders**

Open `http://localhost:3001/login` (or whichever port Next picked) in a browser.
Expected: Sagacity-branded sign-in form with "Email" field and "Send me a login link" button.

- [ ] **Step 5: Manually verify magic-link flow**

1. Enter Denise's email into the form and submit.
2. Expect "Check your inbox" success state.
3. Check the email inbox; click the magic link.
4. Expect redirect to `/academy/my-learning`. Since the page doesn't exist yet, Next will 404 — that's fine for Slice 1. The critical confirmation is that the auth exchange worked: a Supabase session cookie is now set.

Verify the cookie in DevTools → Application → Cookies: look for `sb-<project-ref>-auth-token`.

- [ ] **Step 6: Run the admin-role seed**

```
npm run seed:academy-admin -- denise@sagacitynetwork.net
```

Expected output: `✓ denise@sagacitynetwork.net (<uuid>) granted "admin" role.`

- [ ] **Step 7: Verify the role in the database**

Call `mcp__353fb150-2343-4eea-9fa9-b2e7986afef0__execute_sql` with:

```sql
select u.email, r.role, r.granted_at
from public.user_roles r
join auth.users u on u.id = r.user_id
order by r.granted_at desc;
```

Expected: one row, `denise@sagacitynetwork.net` with `role = 'admin'`.

- [ ] **Step 8: Set ACADEMY_ENABLED in Vercel (production)**

**Do NOT deploy yet.** Just add the env var on Vercel so the next deploy picks it up. Set it to `false` in production for now — Slice 1 ships no public routes, so the flag being off in prod keeps `/login` from being reachable until Slice 2 ships the catalog.

- [ ] **Step 9: Push the branch**

```
git push
```

Expected: branch is up to date with origin. Vercel preview will build automatically.

- [ ] **Step 10: Verify Vercel preview build succeeds**

Check the Vercel dashboard for the preview deployment. Build must succeed. On the preview URL, `/login` should return a redirect to `/` (because `ACADEMY_ENABLED` is not set in preview by default — that's expected and confirms the flag is working).

---

## Self-review checklist

After completing all tasks, run through this once:

**Spec coverage:**
- [ ] All 8 tables from spec §5 exist with RLS (Task 4)
- [ ] RLS policies match spec §5 descriptions (Task 4)
- [ ] Zod schema covers all 10 block types from spec §6 (Task 2)
- [ ] Magic-link flow per spec §7 (Tasks 7, 8)
- [ ] Feature flag from spec §10 Slice 1 (Task 3, Task 6)
- [ ] `/login` page exists per spec §4 (Task 7)
- [ ] `user_roles` seeded with Denise = admin per spec §10 Slice 1 (Task 10)
- [ ] `@supabase/ssr` centralised per spec §10 Slice 1 (Task 5)

**Out of scope for this slice (deferred to later slices):**
- `/academy` routes (Slice 2)
- `<BlockRenderer>` component (Slice 2)
- Stripe checkout (Slice 3)
- Admin block editor (Slice 5)

**Deployment state after this slice:**
- Public site: unchanged (feature flag off in prod)
- `/login` + `/auth/callback` + `/api/auth/sign-out` exist but are redirected to `/` when flag off
- All 8 Academy tables live in Supabase prod with correct RLS
- Denise has `admin` role entry ready for Slice 5
- No user-facing change is visible
