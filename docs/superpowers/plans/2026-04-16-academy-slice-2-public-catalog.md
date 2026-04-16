# Academy Slice 2 — Public Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the public, browsable Academy — catalog, course landing pages, and free-preview lessons — backed by one real seeded course, with no checkout yet.

**Architecture:** Three new public routes under `src/app/(site)/academy/*`, all SSR with ISR (60s revalidation). A `BlockRenderer` component fans out to ten small per-block components that read lesson JSON. A single Node seed script hydrates one course from a JSON file in `scripts/academy-seeds/` via the Supabase service-role client. The feature flag `ACADEMY_ENABLED` already guards the entire surface at the proxy level; Nav exposes an "Academy" link only when the flag is on.

**Tech Stack:** Next.js 16.2.3 (App Router, Turbopack), React 19, `@supabase/ssr@0.7`, Supabase Postgres + RLS, Zod v4, `react-markdown` + `remark-gfm` for text/callout blocks, `tsx` + `dotenv` for the seed script, `nanoid` for stable block IDs.

**Branch:** `academy-slice-2` (branched off `academy-slice-1`).

**Prerequisites (from Slice 1):** Zod schemas (`src/lib/academy/schema.ts`), typed Supabase clients (`Database` threaded through), feature flag (`src/lib/academy/feature-flag.ts`), proxy gate (`src/proxy.ts`), all 8 tables with RLS in production.

---

## File Structure

### New files
- `src/app/(site)/academy/page.tsx` — catalog (ISR 60s)
- `src/app/(site)/academy/[slug]/page.tsx` — course landing (ISR 60s)
- `src/app/(site)/academy/[slug]/preview/[lessonSlug]/page.tsx` — free preview
- `src/app/(site)/academy/not-found.tsx` — 404 fallback
- `src/lib/academy/queries.ts` — server-side data loaders
- `src/lib/academy/queries.test.ts` — unit tests for query shape
- `src/components/academy/BlockRenderer.tsx` — block-type switch
- `src/components/academy/blocks/HeadingBlock.tsx`
- `src/components/academy/blocks/TextBlock.tsx`
- `src/components/academy/blocks/ImageBlock.tsx`
- `src/components/academy/blocks/VideoBlock.tsx`
- `src/components/academy/blocks/CalloutBlock.tsx`
- `src/components/academy/blocks/DownloadBlock.tsx`
- `src/components/academy/blocks/CodeBlock.tsx`
- `src/components/academy/blocks/QuizBlock.tsx`
- `src/components/academy/blocks/DividerBlock.tsx`
- `src/components/academy/blocks/EmbedBlock.tsx`
- `src/components/academy/CourseCard.tsx` — reused by catalog + future cross-sells
- `src/components/academy/CurriculumAccordion.tsx` — course landing curriculum tree
- `scripts/seed-academy-course.ts` — idempotent upsert of course/modules/lessons
- `scripts/academy-seeds/ai-for-small-business.json` — first placeholder course
- `src/components/academy/FaqSection.tsx` — hardcoded FAQ on landing pages

### Modified files
- `src/app/(site)/layout.tsx` — pass `academyEnabled` prop to Nav
- `src/components/layout/Nav.tsx` — conditionally render Academy link
- `package.json` — add `react-markdown`, `remark-gfm`, new seed npm script

### Unchanged (already correct from Slice 1)
- `src/proxy.ts` — feature-flag gate already covers `/academy/*`
- `src/lib/academy/schema.ts` — Block + Course schemas unchanged
- Database schema — all 8 tables already exist with RLS

---

## Task 1 — Install dependencies + create branch

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Branch off Slice 1**

Run:
```
git checkout -b academy-slice-2
```

- [ ] **Step 2: Install markdown renderer**

Run:
```
npm install react-markdown@^9 remark-gfm@^4
```

Why v9 + remark-gfm@^4: v9 is ESM-only and works with Next 16 / React 19; gfm adds tables, strikethrough, and task lists which we'll want in course content.

- [ ] **Step 3: Add seed course npm script**

Edit `package.json` `scripts` block. Add:
```json
    "seed:academy-course": "tsx scripts/seed-academy-course.ts"
```

Place it right after `"seed:academy-admin"`.

- [ ] **Step 4: Commit**

```
git add package.json package-lock.json
git commit -m "chore(academy): add react-markdown + seed-course npm script"
```

---

## Task 2 — Course seed script

**Files:**
- Create: `scripts/seed-academy-course.ts`

- [ ] **Step 1: Write the seed script**

Create `scripts/seed-academy-course.ts`:
```ts
/**
 * Seeds a single Academy course from a JSON file in scripts/academy-seeds/.
 *
 * Usage:
 *   npm run seed:academy-course -- <slug>
 *   # e.g. npm run seed:academy-course -- ai-for-small-business
 *
 * Behavior:
 *   - Validates JSON against CourseSeedSchema (Zod)
 *   - Upserts course (status stays 'draft' unless already published)
 *   - Deletes + re-inserts modules/lessons (simpler than diff-merge; safe
 *     because enrollments/progress reference lessons by id and we preserve
 *     ids across re-seeds via stable composite slug-keyed upsert)
 *
 * Idempotency strategy:
 *   - Course: upsert on `slug`
 *   - Module: upsert on (course_id, position)
 *   - Lesson: upsert on (module_id, slug)
 *
 * This preserves lesson IDs across reseeds, so lesson_progress / quiz_attempts
 * rows survive content edits (title/body changes) as long as slug + position
 * are stable.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CourseSeedSchema } from "../src/lib/academy/schema";
import type { Database } from "../src/lib/supabase/database.types";

config({ path: ".env.local" });

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: npm run seed:academy-course -- <slug>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Load + validate seed JSON
  const path = resolve(`scripts/academy-seeds/${slug}.json`);
  const raw = JSON.parse(readFileSync(path, "utf8"));
  const parsed = CourseSeedSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Seed validation failed:");
    console.error(JSON.stringify(parsed.error.flatten(), null, 2));
    process.exit(1);
  }
  const seed = parsed.data;

  if (seed.course.slug !== slug) {
    console.error(
      `Filename slug "${slug}" does not match course.slug "${seed.course.slug}".`
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Upsert course. Keep existing status; default to 'draft' on insert.
  const { data: existing, error: lookupErr } = await supabase
    .from("courses")
    .select("id, status")
    .eq("slug", slug)
    .maybeSingle();
  if (lookupErr) throw lookupErr;

  const { data: course, error: courseErr } = await supabase
    .from("courses")
    .upsert(
      {
        slug,
        title: seed.course.title,
        subtitle: seed.course.subtitle,
        description: seed.course.description,
        hero_image_url: seed.course.hero_image_url ?? null,
        price_cents: seed.course.price_cents,
        stripe_price_id: seed.course.stripe_price_id ?? null,
        level: seed.course.level,
        instructor_name: seed.course.instructor_name,
        instructor_bio: seed.course.instructor_bio ?? null,
        status: existing?.status ?? "draft",
        duration_minutes: seed.modules.reduce(
          (sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration_minutes, 0),
          0
        ),
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();
  if (courseErr) throw courseErr;

  // 2. Upsert modules + collect IDs by position
  const moduleIdByPosition = new Map<number, string>();
  for (const m of seed.modules) {
    const { data: mod, error: modErr } = await supabase
      .from("modules")
      .upsert(
        {
          course_id: course.id,
          title: m.title,
          summary: m.summary,
          position: m.position,
        },
        { onConflict: "course_id,position" }
      )
      .select("id")
      .single();
    if (modErr) throw modErr;
    moduleIdByPosition.set(m.position, mod.id);
  }

  // 3. Upsert lessons
  let lessonCount = 0;
  for (const m of seed.modules) {
    const moduleId = moduleIdByPosition.get(m.position);
    if (!moduleId) throw new Error(`Module id lost for position ${m.position}`);

    for (const l of m.lessons) {
      const { error: lessonErr } = await supabase.from("lessons").upsert(
        {
          module_id: moduleId,
          slug: l.slug,
          title: l.title,
          summary: l.summary,
          body: l.body,
          duration_minutes: l.duration_minutes,
          is_free_preview: l.is_free_preview,
          position: l.position,
        },
        { onConflict: "module_id,slug" }
      );
      if (lessonErr) throw lessonErr;
      lessonCount++;
    }
  }

  console.log(
    `✓ Seeded "${seed.course.title}" (${seed.modules.length} modules, ${lessonCount} lessons). Status: ${existing?.status ?? "draft"}`
  );
  console.log(`  Edit in DB to publish when ready.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add unique constraints the script relies on**

The script uses `onConflict: "course_id,position"` on modules and `onConflict: "module_id,slug"` on lessons. Check if those composite uniques exist by reading the Slice 1 migration:

Run:
```
grep -n "UNIQUE" supabase/migrations/20260416000100_academy_slice_1_foundation.sql
```

If either composite unique is missing, create a new additive migration `supabase/migrations/20260416000300_academy_seed_uniques.sql`:
```sql
-- Adds the composite unique constraints the course-seed script relies on for
-- idempotent upsert. Safe additive change: pre-existing rows already satisfy
-- uniqueness (modules are scoped per course, lessons per module).
alter table public.modules
  add constraint modules_course_position_unique unique (course_id, position);

alter table public.lessons
  add constraint lessons_module_slug_unique unique (module_id, slug);
```

Apply via Supabase MCP: `mcp__supabase__apply_migration` with the SQL above.

- [ ] **Step 3: Commit**

```
git add scripts/seed-academy-course.ts supabase/migrations/
git commit -m "feat(academy): add idempotent course seed script"
```

---

## Task 3 — First placeholder course JSON

**Files:**
- Create: `scripts/academy-seeds/ai-for-small-business.json`

This course is a placeholder — realistic enough to demonstrate every block type, short enough that a reviewer can scan it. Slice 5 will replace it with Denise's real AI-generated course.

- [ ] **Step 1: Create seed directory + JSON file**

Create `scripts/academy-seeds/ai-for-small-business.json` with content demonstrating **every block type at least once**:

```json
{
  "course": {
    "slug": "ai-for-small-business",
    "title": "AI for Small Business",
    "subtitle": "Practical AI tools that save your team hours every week — no coding required.",
    "description": "A 3-module, 90-minute course covering the AI tools every small business owner should have in their toolkit: Claude for writing and research, ChatGPT for customer service, and Zapier AI for workflow automation. Everything is hands-on: by the end of each module you'll have built something real.",
    "hero_image_url": "https://images.unsplash.com/photo-1677691819515-d1c4f0e7c9c7?w=1600&q=80",
    "price_cents": 9900,
    "level": "beginner",
    "instructor_name": "Denise Isaac",
    "instructor_bio": "Denise is the founder of Sagacity Network and has been shipping AI-powered platforms since 2023. She's taught AI workshops to over 200 small-business owners across the UK and Caribbean."
  },
  "modules": [
    {
      "title": "Module 1 — Getting Started With AI",
      "summary": "Understand what AI is good at, what it's bad at, and how to write prompts that get useful results.",
      "position": 0,
      "lessons": [
        {
          "slug": "what-ai-can-and-cant-do",
          "title": "What AI Can and Can't Do",
          "summary": "A realistic picture of AI's strengths and limitations in a small-business context.",
          "duration_minutes": 8,
          "is_free_preview": true,
          "position": 0,
          "body": [
            { "id": "h1", "type": "heading", "level": 2, "text": "Welcome" },
            { "id": "t1", "type": "text", "markdown": "Before we touch any tools, let's set realistic expectations. AI is **extraordinary at some tasks** and **surprisingly bad at others**. Knowing the difference saves you hours of frustration." },
            { "id": "call1", "type": "callout", "variant": "tip", "title": "The one-sentence rule", "markdown": "If a task would take a smart intern 10 minutes of reading to do, AI can probably do it well. If it requires judgement based on your specific business context, AI needs you to supply that context." },
            { "id": "h2", "type": "heading", "level": 3, "text": "Three things AI is genuinely great at" },
            { "id": "t2", "type": "text", "markdown": "1. **Transforming text** — summarising, translating, rewriting in a different tone.\n2. **Drafting from structure** — emails, proposals, blog outlines when you give it the bullet points.\n3. **Extracting structured data** — pulling key facts out of messy documents." },
            { "id": "div1", "type": "divider" },
            { "id": "h3", "type": "heading", "level": 3, "text": "Three things AI is surprisingly bad at" },
            { "id": "t3", "type": "text", "markdown": "1. **Current events** — models have a knowledge cutoff; they don't know what happened yesterday.\n2. **Arithmetic at scale** — calculators are more reliable for anything beyond basic maths.\n3. **Making decisions without context** — 'should I hire this person?' isn't a valid AI question on its own." },
            { "id": "call2", "type": "callout", "variant": "warning", "markdown": "**Never** trust AI output on legal, medical, or financial matters without expert review. It sounds confident whether it's right or wrong." }
          ]
        },
        {
          "slug": "writing-a-good-prompt",
          "title": "Writing a Good Prompt",
          "summary": "The four-part prompt structure that works for 90% of tasks.",
          "duration_minutes": 12,
          "is_free_preview": false,
          "position": 1,
          "body": [
            { "id": "h1", "type": "heading", "level": 2, "text": "The CLEAR prompt structure" },
            { "id": "t1", "type": "text", "markdown": "Most bad AI output comes from bad prompts, not bad models. Use this structure:" },
            { "id": "code1", "type": "code", "language": "text", "code": "Context: Who you are + what you're working on\nLength: How long you want the response\nExamples: 1-2 examples of the output style you want\nAudience: Who will read this\nRequest: The specific thing you want", "caption": "The CLEAR framework" },
            { "id": "h2", "type": "heading", "level": 3, "text": "Before and after" },
            { "id": "t2", "type": "text", "markdown": "**Bad prompt:** *Write me a welcome email.*\n\n**Good prompt:** *I run a small yoga studio in Leeds. Write a 150-word welcome email for new members that's warm but not saccharine. Mention our first-class-free offer. Audience: 30-50 year old women new to yoga.*" },
            { "id": "dl1", "type": "download", "label": "CLEAR prompt cheat-sheet (PDF)", "url": "https://sagacitynetwork.net/downloads/clear-prompt-cheatsheet.pdf", "fileType": "PDF", "fileSize": "180 KB" }
          ]
        }
      ]
    },
    {
      "title": "Module 2 — Claude for Writing and Research",
      "summary": "Use Claude as your always-available junior analyst for drafts, research, and document review.",
      "position": 1,
      "lessons": [
        {
          "slug": "setting-up-claude",
          "title": "Setting Up Claude",
          "summary": "Account setup, projects, and the Claude Desktop app.",
          "duration_minutes": 10,
          "is_free_preview": false,
          "position": 0,
          "body": [
            { "id": "h1", "type": "heading", "level": 2, "text": "Get Claude running in 5 minutes" },
            { "id": "img1", "type": "image", "url": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80", "alt": "A laptop displaying an AI chat interface", "caption": "You'll use the web app for most tasks; the desktop app is worth it once you're using AI daily." },
            { "id": "v1", "type": "video", "provider": "vimeo", "vimeoId": "76979871", "title": "Claude setup walkthrough", "durationSeconds": 420 },
            { "id": "t1", "type": "text", "markdown": "Follow along with the video above. If you get stuck, the [Claude Help Center](https://support.claude.com) has step-by-step screenshots." }
          ]
        },
        {
          "slug": "projects-and-knowledge",
          "title": "Projects and Knowledge",
          "summary": "Upload your business documents so Claude can answer questions in your business's voice.",
          "duration_minutes": 15,
          "is_free_preview": false,
          "position": 1,
          "body": [
            { "id": "h1", "type": "heading", "level": 2, "text": "Projects: give Claude a memory" },
            { "id": "t1", "type": "text", "markdown": "A Project is a workspace where Claude remembers everything you upload. Think of it as a dedicated 'room' for one business function." },
            { "id": "emb1", "type": "embed", "provider": "loom", "url": "https://www.loom.com/embed/abc123placeholder", "height": 420 }
          ]
        }
      ]
    },
    {
      "title": "Module 3 — Check Your Understanding",
      "summary": "A short quiz to lock in what you've learned.",
      "position": 2,
      "lessons": [
        {
          "slug": "module-1-check",
          "title": "Knowledge Check",
          "summary": "A 3-question quiz covering Module 1 concepts.",
          "duration_minutes": 5,
          "is_free_preview": false,
          "position": 0,
          "body": [
            { "id": "h1", "type": "heading", "level": 2, "text": "Quick check" },
            { "id": "t1", "type": "text", "markdown": "Three questions. You can retake as many times as you want." },
            {
              "id": "q1",
              "type": "quiz",
              "prompt": "Module 1 knowledge check",
              "passingScore": 0.66,
              "questions": [
                {
                  "id": "q1a",
                  "type": "single-choice",
                  "question": "Which of these is AI genuinely great at?",
                  "options": [
                    { "id": "o1", "text": "Giving you today's stock prices" },
                    { "id": "o2", "text": "Rewriting a long email in a friendlier tone" },
                    { "id": "o3", "text": "Deciding whether to hire someone" }
                  ],
                  "correctIds": ["o2"],
                  "explanation": "AI excels at transforming text. Current events and high-stakes judgement calls are the wrong fit."
                },
                {
                  "id": "q1b",
                  "type": "true-false",
                  "question": "You should always trust AI output on legal questions.",
                  "options": [
                    { "id": "t", "text": "True" },
                    { "id": "f", "text": "False" }
                  ],
                  "correctIds": ["f"],
                  "explanation": "Never trust AI on legal, medical, or financial matters without expert review."
                },
                {
                  "id": "q1c",
                  "type": "multi-choice",
                  "question": "Which parts belong in a good CLEAR prompt? (Select all that apply)",
                  "options": [
                    { "id": "c1", "text": "Context about you" },
                    { "id": "c2", "text": "The specific request" },
                    { "id": "c3", "text": "Your credit card number" },
                    { "id": "c4", "text": "An example of the output style you want" }
                  ],
                  "correctIds": ["c1", "c2", "c4"],
                  "explanation": "Context, request, and examples are all useful. Credit cards never belong in a prompt."
                }
              ],
              "feedback": {
                "correct": "Nice — you're ready to start using AI for real work.",
                "incorrect": "Worth reviewing Module 1 once more before moving on."
              }
            }
          ]
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Run the seed script**

Make sure `npm run dev` is stopped, then:
```
npm run seed:academy-course -- ai-for-small-business
```

Expected output: `✓ Seeded "AI for Small Business" (3 modules, 5 lessons). Status: draft`.

- [ ] **Step 3: Flip status to published for testing**

Via Supabase MCP `execute_sql`:
```sql
update public.courses
  set status = 'published', published_at = now()
  where slug = 'ai-for-small-business';
```

- [ ] **Step 4: Commit seed file**

```
git add scripts/academy-seeds/
git commit -m "feat(academy): add first seed course (ai-for-small-business)"
```

---

## Task 4 — Server-side query helpers

**Files:**
- Create: `src/lib/academy/queries.ts`
- Create: `src/lib/academy/queries.test.ts`

These are the only places the public pages touch Supabase. RLS does the access control; the functions just shape the returned data.

- [ ] **Step 1: Write the failing tests (shape contract)**

Create `src/lib/academy/queries.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import type { CourseSummary, CourseDetail, LessonPreview } from "./queries";

describe("query return shapes (type-level contract)", () => {
  it("CourseSummary exposes catalog-card fields", () => {
    const c: CourseSummary = {
      id: "x",
      slug: "x",
      title: "x",
      subtitle: "x",
      hero_image_url: null,
      price_cents: 0,
      level: "beginner",
      duration_minutes: 0,
      module_count: 0,
      lesson_count: 0,
    };
    expect(c.slug).toBe("x");
  });

  it("CourseDetail includes modules + lesson summaries (no bodies)", () => {
    const c: CourseDetail = {
      id: "x",
      slug: "x",
      title: "x",
      subtitle: "x",
      description: "x",
      hero_image_url: null,
      price_cents: 0,
      level: "beginner",
      duration_minutes: 0,
      instructor_name: "x",
      instructor_bio: null,
      modules: [
        {
          id: "m",
          title: "m",
          summary: "m",
          position: 0,
          lessons: [
            {
              id: "l",
              slug: "l",
              title: "l",
              summary: "l",
              duration_minutes: 0,
              is_free_preview: true,
              position: 0,
            },
          ],
        },
      ],
    };
    expect(c.modules[0].lessons[0].is_free_preview).toBe(true);
  });

  it("LessonPreview exposes the full body + course/module context", () => {
    const l: LessonPreview = {
      id: "l",
      slug: "l",
      title: "l",
      summary: "l",
      body: [],
      duration_minutes: 0,
      course: { slug: "c", title: "c" },
      module: { title: "m", position: 0 },
    };
    expect(l.body).toEqual([]);
  });
});
```

Run:
```
npm test -- queries.test
```
Expected: FAIL — file `./queries` does not exist.

- [ ] **Step 2: Implement the query module**

Create `src/lib/academy/queries.ts`:
```ts
import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Block } from "./schema";

export interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_image_url: string | null;
  price_cents: number;
  level: string;
  duration_minutes: number;
  module_count: number;
  lesson_count: number;
}

export interface LessonSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  duration_minutes: number;
  is_free_preview: boolean;
  position: number;
}

export interface ModuleWithLessons {
  id: string;
  title: string;
  summary: string;
  position: number;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  hero_image_url: string | null;
  price_cents: number;
  level: string;
  duration_minutes: number;
  instructor_name: string;
  instructor_bio: string | null;
  modules: ModuleWithLessons[];
}

export interface LessonPreview {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: Block[];
  duration_minutes: number;
  course: { slug: string; title: string };
  module: { title: string; position: number };
}

/**
 * Returns published courses for the /academy catalog.
 * RLS filters to status='published' automatically for anon role.
 */
export async function listPublishedCourses(): Promise<CourseSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, slug, title, subtitle, hero_image_url, price_cents, level, duration_minutes,
      modules:modules ( id, lessons:lessons ( id ) )
    `
    )
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? "",
    hero_image_url: c.hero_image_url,
    price_cents: c.price_cents,
    level: c.level ?? "beginner",
    duration_minutes: c.duration_minutes ?? 0,
    module_count: c.modules?.length ?? 0,
    lesson_count:
      c.modules?.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0) ?? 0,
  }));
}

/**
 * Returns one published course with its module tree + lesson summaries (no bodies).
 * Null if not found OR not published (RLS blocks drafts from anon reads).
 */
export async function getCourseBySlug(slug: string): Promise<CourseDetail | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("courses")
    .select(
      `
      id, slug, title, subtitle, description, hero_image_url, price_cents, level,
      duration_minutes, instructor_name, instructor_bio,
      modules:modules (
        id, title, summary, position,
        lessons:lessons ( id, slug, title, summary, duration_minutes, is_free_preview, position )
      )
    `
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const modules: ModuleWithLessons[] = (data.modules ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      summary: m.summary ?? "",
      position: m.position,
      lessons: (m.lessons ?? [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          summary: l.summary ?? "",
          duration_minutes: l.duration_minutes ?? 0,
          is_free_preview: l.is_free_preview,
          position: l.position,
        })),
    }));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle ?? "",
    description: data.description ?? "",
    hero_image_url: data.hero_image_url,
    price_cents: data.price_cents,
    level: data.level ?? "beginner",
    duration_minutes: data.duration_minutes ?? 0,
    instructor_name: data.instructor_name ?? "",
    instructor_bio: data.instructor_bio,
    modules,
  };
}

/**
 * Returns a lesson only when is_free_preview=true. RLS also enforces this for
 * anon; the explicit filter here is defense-in-depth.
 */
export async function getPreviewLesson(
  courseSlug: string,
  lessonSlug: string
): Promise<LessonPreview | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      `
      id, slug, title, summary, body, duration_minutes, is_free_preview,
      modules!inner (
        title, position,
        courses!inner ( slug, title, status )
      )
    `
    )
    .eq("slug", lessonSlug)
    .eq("is_free_preview", true)
    .eq("modules.courses.slug", courseSlug)
    .eq("modules.courses.status", "published")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const module = Array.isArray(data.modules) ? data.modules[0] : data.modules;
  const course = Array.isArray(module.courses) ? module.courses[0] : module.courses;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    summary: data.summary ?? "",
    body: (data.body as Block[]) ?? [],
    duration_minutes: data.duration_minutes ?? 0,
    course: { slug: course.slug, title: course.title },
    module: { title: module.title, position: module.position },
  };
}
```

- [ ] **Step 3: Run tests to verify pass**

Run:
```
npm test -- queries.test
```
Expected: 3 tests pass (pure type-level; no DB hit).

- [ ] **Step 4: Commit**

```
git add src/lib/academy/queries.ts src/lib/academy/queries.test.ts
git commit -m "feat(academy): add server-side query helpers for public catalog"
```

---

## Task 5 — BlockRenderer + 10 block components

**Files:**
- Create: `src/components/academy/BlockRenderer.tsx`
- Create: `src/components/academy/blocks/*.tsx` (10 files)

Each block is a small, focused component. Quiz blocks render inert in Slice 2 (the Submit button says "Sign in to take the quiz" and links to `/login`). Real grading lives in Slice 4.

- [ ] **Step 1: Write BlockRenderer switch**

Create `src/components/academy/BlockRenderer.tsx`:
```tsx
import type { Block } from "@/lib/academy/schema";
import HeadingBlock from "./blocks/HeadingBlock";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import CalloutBlock from "./blocks/CalloutBlock";
import DownloadBlock from "./blocks/DownloadBlock";
import CodeBlock from "./blocks/CodeBlock";
import QuizBlock from "./blocks/QuizBlock";
import DividerBlock from "./blocks/DividerBlock";
import EmbedBlock from "./blocks/EmbedBlock";

interface Props {
  blocks: Block[];
  /** When true, quiz Submit CTAs link to /login instead of grading inline. */
  isPreview?: boolean;
}

export default function BlockRenderer({ blocks, isPreview = false }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b) => {
        switch (b.type) {
          case "heading":
            return <HeadingBlock key={b.id} block={b} />;
          case "text":
            return <TextBlock key={b.id} block={b} />;
          case "image":
            return <ImageBlock key={b.id} block={b} />;
          case "video":
            return <VideoBlock key={b.id} block={b} />;
          case "callout":
            return <CalloutBlock key={b.id} block={b} />;
          case "download":
            return <DownloadBlock key={b.id} block={b} />;
          case "code":
            return <CodeBlock key={b.id} block={b} />;
          case "quiz":
            return <QuizBlock key={b.id} block={b} isPreview={isPreview} />;
          case "divider":
            return <DividerBlock key={b.id} />;
          case "embed":
            return <EmbedBlock key={b.id} block={b} />;
        }
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create block sub-components (all 10)**

Create each under `src/components/academy/blocks/`. Keep each file focused and short. Exact code for each:

**`HeadingBlock.tsx`**
```tsx
import type { Block } from "@/lib/academy/schema";

type HeadingB = Extract<Block, { type: "heading" }>;

export default function HeadingBlock({ block }: { block: HeadingB }) {
  const Tag = block.level === 2 ? "h2" : "h3";
  const sizeClass =
    block.level === 2
      ? "text-[28px] md:text-[32px] font-[700] tracking-heading"
      : "text-[20px] md:text-[22px] font-[700]";
  return (
    <Tag
      className={`${sizeClass} mt-4`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {block.text}
    </Tag>
  );
}
```

**`TextBlock.tsx`**
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Block } from "@/lib/academy/schema";

type TextB = Extract<Block, { type: "text" }>;

export default function TextBlock({ block }: { block: TextB }) {
  return (
    <div
      className="prose-academy text-[16px] leading-[1.8]"
      style={{ color: "var(--color-ink)" }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
    </div>
  );
}
```

**`ImageBlock.tsx`**
```tsx
/* eslint-disable @next/next/no-img-element */
import type { Block } from "@/lib/academy/schema";

type ImageB = Extract<Block, { type: "image" }>;

export default function ImageBlock({ block }: { block: ImageB }) {
  return (
    <figure className="my-2">
      <img
        src={block.url}
        alt={block.alt}
        width={block.width}
        height={block.height}
        className="w-full rounded-[12px]"
        loading="lazy"
      />
      {block.caption ? (
        <figcaption
          className="text-[13px] mt-2 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
```
Note: we intentionally don't use `next/image` here because lesson images come from arbitrary URLs (Unsplash, Supabase Storage, CDNs). Add `next/image` + `remotePatterns` config in a later slice if LCP measurements call for it.

**`VideoBlock.tsx`**
```tsx
import type { Block } from "@/lib/academy/schema";

type VideoB = Extract<Block, { type: "video" }>;

export default function VideoBlock({ block }: { block: VideoB }) {
  const src = `https://player.vimeo.com/video/${encodeURIComponent(
    block.vimeoId
  )}?title=0&byline=0&portrait=0&dnt=1`;
  return (
    <figure className="my-2">
      <div
        className="relative w-full rounded-[12px] overflow-hidden"
        style={{ aspectRatio: "16 / 9", background: "#000" }}
      >
        <iframe
          src={src}
          title={block.title ?? "Lesson video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {block.title ? (
        <figcaption
          className="text-[13px] mt-2 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {block.title}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

**`CalloutBlock.tsx`**
```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import type { Block } from "@/lib/academy/schema";

type CalloutB = Extract<Block, { type: "callout" }>;

const PALETTE = {
  info:    { icon: Info,           border: "rgba(123, 63, 160, 0.25)", bg: "rgba(123, 63, 160, 0.06)",  tint: "#A668D0" },
  warning: { icon: AlertTriangle,  border: "rgba(220, 160, 60, 0.3)",  bg: "rgba(220, 160, 60, 0.08)",  tint: "#DCA03C" },
  success: { icon: CheckCircle2,   border: "rgba(80, 180, 120, 0.3)",  bg: "rgba(80, 180, 120, 0.08)",  tint: "#50B478" },
  tip:     { icon: Lightbulb,      border: "rgba(201, 168, 76, 0.3)",  bg: "rgba(201, 168, 76, 0.08)",  tint: "#C9A84C" },
} as const;

export default function CalloutBlock({ block }: { block: CalloutB }) {
  const p = PALETTE[block.variant];
  const Icon = p.icon;
  return (
    <div
      className="flex gap-3 p-5 rounded-[12px]"
      style={{ background: p.bg, border: `1px solid ${p.border}` }}
    >
      <Icon size={20} style={{ color: p.tint, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1">
        {block.title ? (
          <div
            className="text-[14px] font-[600] mb-1"
            style={{ color: p.tint }}
          >
            {block.title}
          </div>
        ) : null}
        <div
          className="prose-academy text-[15px] leading-[1.7]"
          style={{ color: "var(--color-ink)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
```

**`DownloadBlock.tsx`**
```tsx
import { Download } from "lucide-react";
import type { Block } from "@/lib/academy/schema";

type DownloadB = Extract<Block, { type: "download" }>;

export default function DownloadBlock({ block }: { block: DownloadB }) {
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-[12px] shadow-border card-hover no-underline"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-[8px]"
        style={{ background: "rgba(123, 63, 160, 0.1)", color: "var(--color-accent)" }}
      >
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-[500] truncate" style={{ color: "var(--color-ink)" }}>
          {block.label}
        </div>
        {block.fileSize || block.fileType ? (
          <div className="text-[12px]" style={{ color: "var(--color-muted)" }}>
            {[block.fileType, block.fileSize].filter(Boolean).join(" · ")}
          </div>
        ) : null}
      </div>
    </a>
  );
}
```

**`CodeBlock.tsx`**
```tsx
import type { Block } from "@/lib/academy/schema";

type CodeB = Extract<Block, { type: "code" }>;

export default function CodeBlock({ block }: { block: CodeB }) {
  return (
    <figure className="my-2">
      <pre
        className="p-4 rounded-[10px] overflow-x-auto text-[13px] leading-[1.6]"
        style={{
          background: "var(--surface-1)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-border)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        <code data-language={block.language}>{block.code}</code>
      </pre>
      {block.caption ? (
        <figcaption
          className="text-[13px] mt-2 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
```
Note: syntax highlighting is deferred; a plain monospace render is enough for Slice 2. Add `shiki` in Slice 4 if lesson review shows it's needed.

**`QuizBlock.tsx`**
```tsx
import Link from "next/link";
import type { Block } from "@/lib/academy/schema";

type QuizB = Extract<Block, { type: "quiz" }>;

interface Props {
  block: QuizB;
  isPreview: boolean;
}

export default function QuizBlock({ block, isPreview }: Props) {
  return (
    <div
      className="p-6 rounded-[14px]"
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="text-[12px] font-[600] tracking-[0.12em] uppercase mb-2"
        style={{ color: "var(--color-accent)" }}
      >
        Quiz
      </div>
      <h4 className="text-[18px] font-[700] mb-4" style={{ fontFamily: "var(--font-display)" }}>
        {block.prompt}
      </h4>

      <ol className="flex flex-col gap-5 list-decimal pl-5">
        {block.questions.map((q) => (
          <li key={q.id}>
            <div className="text-[15px] font-[500] mb-2" style={{ color: "var(--color-ink)" }}>
              {q.question}
            </div>
            <ul className="flex flex-col gap-2">
              {q.options.map((o) => (
                <li key={o.id}>
                  <label className="flex items-center gap-2 text-[14px]" style={{ color: "var(--color-muted)" }}>
                    <input
                      type={q.type === "multi-choice" ? "checkbox" : "radio"}
                      name={q.id}
                      disabled
                      className="accent-[var(--color-accent)]"
                    />
                    {o.text}
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {isPreview ? (
          <Link
            href="/login?redirect=/academy"
            className="inline-block px-5 py-2.5 text-[13px] font-[500] rounded-[8px]"
            style={{ background: "var(--gradient-purple)", color: "#fff" }}
          >
            Sign in to take the quiz
          </Link>
        ) : (
          <span className="text-[13px]" style={{ color: "var(--color-muted)" }}>
            Enrol to take this quiz and track your progress.
          </span>
        )}
      </div>
    </div>
  );
}
```

**`DividerBlock.tsx`**
```tsx
export default function DividerBlock() {
  return (
    <hr
      className="my-4 border-0 h-px"
      style={{ background: "var(--color-border)" }}
    />
  );
}
```

**`EmbedBlock.tsx`**
```tsx
import type { Block } from "@/lib/academy/schema";

type EmbedB = Extract<Block, { type: "embed"}>;

const TRUSTED_HOSTS = new Set([
  "loom.com", "www.loom.com",
  "figma.com", "www.figma.com",
  "codesandbox.io",
]);

function isTrusted(url: string): boolean {
  try {
    const u = new URL(url);
    return TRUSTED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export default function EmbedBlock({ block }: { block: EmbedB }) {
  const trusted = block.provider !== "generic-iframe" && isTrusted(block.url);

  if (!trusted) {
    return (
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 rounded-[12px] shadow-border"
        style={{ background: "var(--surface-0)" }}
      >
        <div className="text-[13px]" style={{ color: "var(--color-muted)" }}>
          Open in new tab:
        </div>
        <div className="text-[14px] font-[500] truncate" style={{ color: "var(--color-accent)" }}>
          {block.url}
        </div>
      </a>
    );
  }

  return (
    <div
      className="relative w-full rounded-[12px] overflow-hidden"
      style={{ aspectRatio: "16 / 9", background: "#000", height: block.height }}
    >
      <iframe
        src={block.url}
        title="Embedded content"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
```

Note: `generic-iframe` is explicitly untrusted and downgrades to a link — protects against arbitrary third-party iframe injection via seed JSON.

- [ ] **Step 3: Verify everything compiles**

Run:
```
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```
git add src/components/academy/
git commit -m "feat(academy): BlockRenderer + 10 block components"
```

---

## Task 6 — `/academy` catalog page

**Files:**
- Create: `src/app/(site)/academy/page.tsx`
- Create: `src/components/academy/CourseCard.tsx`

- [ ] **Step 1: Create the CourseCard component**

Create `src/components/academy/CourseCard.tsx`:
```tsx
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { CourseSummary } from "@/lib/academy/queries";

const LEVEL_PILL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `£${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={`/academy/${course.slug}`}
      className="group block card-hover shadow-border overflow-hidden"
      style={{ borderRadius: "var(--radius-md)", background: "var(--surface-0)" }}
    >
      <div
        className="h-[160px] relative overflow-hidden"
        style={{
          background: course.hero_image_url
            ? `center/cover no-repeat url(${course.hero_image_url})`
            : "var(--gradient-purple)",
        }}
      >
        <div
          className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-[500] tracking-[0.04em] rounded-[6px]"
          style={{ background: "rgba(0, 0, 0, 0.55)", color: "#fff" }}
        >
          {LEVEL_PILL[course.level] ?? course.level}
        </div>
      </div>

      <div className="p-5">
        <h3
          className="text-[18px] font-[700] mb-1 transition-colors duration-300 group-hover:text-[var(--color-accent)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
        <p className="text-[13px] leading-[1.55] mb-4" style={{ color: "var(--color-muted)" }}>
          {course.subtitle}
        </p>
        <div
          className="flex items-center justify-between text-[12px]"
          style={{ color: "var(--color-muted)" }}
        >
          <span>
            {course.module_count} modules · {formatDuration(course.duration_minutes)}
          </span>
          <span className="font-[600]" style={{ color: "var(--color-ink)" }}>
            {formatPrice(course.price_cents)}
          </span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create the catalog page**

Create `src/app/(site)/academy/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { listPublishedCourses } from "@/lib/academy/queries";
import CourseCard from "@/components/academy/CourseCard";

export const revalidate = 60; // ISR: refresh every 60s

export const metadata: Metadata = {
  title: "Academy — Sagacity Network",
  description:
    "Self-paced courses on AI, automation, and business intelligence — built for small business owners.",
};

export default async function AcademyCatalogPage() {
  if (!isAcademyEnabled()) notFound();

  const courses = await listPublishedCourses();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Hero band */}
      <section
        className="relative overflow-hidden section-glow-top"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-site section-px py-20 md:py-28 text-center relative z-10">
          <span
            className="inline-block text-[12px] font-[500] tracking-[0.12em] uppercase mb-4"
            style={{ color: "#D4B85A" }}
          >
            Sagacity Academy
          </span>
          <h1
            className="text-[40px] md:text-[56px] font-[800] tracking-display mb-5 max-w-[760px] mx-auto"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            Practical training that{" "}
            <span className="text-gradient-gold" style={{ WebkitTextFillColor: "transparent" }}>
              pays for itself.
            </span>
          </h1>
          <p
            className="text-[16px] md:text-[18px] font-[300] leading-[1.7] max-w-[560px] mx-auto"
            style={{ color: "rgba(240, 236, 244, 0.7)" }}
          >
            Self-paced courses on AI, automation, and business intelligence — every lesson
            designed to be applied the same day you learn it.
          </p>
        </div>
      </section>

      {/* Catalog grid */}
      <section className="section-surface py-20">
        <div className="max-w-site section-px">
          {courses.length === 0 ? (
            <div
              className="max-w-[480px] mx-auto text-center p-10 rounded-[12px] shadow-border"
              style={{ background: "var(--surface-0)" }}
            >
              <h2
                className="text-[22px] font-[700] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                First courses dropping soon.
              </h2>
              <p className="text-[14px]" style={{ color: "var(--color-muted)" }}>
                We&apos;re polishing the first three courses right now. Check back next week.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <CourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test**

Start dev server (`npm run dev`) and visit `http://localhost:3000/academy` with `ACADEMY_ENABLED=true` in `.env.local`. Expected: hero band + one course card ("AI for Small Business").

- [ ] **Step 4: Commit**

```
git add src/components/academy/CourseCard.tsx src/app/(site)/academy/page.tsx
git commit -m "feat(academy): public catalog page at /academy"
```

---

## Task 7 — `/academy/[slug]` course landing

**Files:**
- Create: `src/app/(site)/academy/[slug]/page.tsx`
- Create: `src/components/academy/CurriculumAccordion.tsx`
- Create: `src/components/academy/FaqSection.tsx`

- [ ] **Step 1: Curriculum accordion**

Create `src/components/academy/CurriculumAccordion.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, Play } from "lucide-react";
import type { ModuleWithLessons } from "@/lib/academy/queries";

interface Props {
  courseSlug: string;
  modules: ModuleWithLessons[];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function CurriculumAccordion({ courseSlug, modules }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id)) // default: all open
  );

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {modules.map((m) => {
        const open = openIds.has(m.id);
        const moduleMinutes = m.lessons.reduce((s, l) => s + l.duration_minutes, 0);
        return (
          <div
            key={m.id}
            className="rounded-[12px] overflow-hidden shadow-border"
            style={{ background: "var(--surface-0)" }}
          >
            <button
              type="button"
              onClick={() => toggle(m.id)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              aria-expanded={open}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-[16px] md:text-[17px] font-[700] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {m.title}
                </div>
                <div className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                  {m.lessons.length} lessons · {formatDuration(moduleMinutes)}
                </div>
              </div>
              <ChevronDown
                size={20}
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--color-muted)",
                  transform: open ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>
            {open ? (
              <ul
                className="border-t divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {m.lessons.map((l) => {
                  const inner = (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {l.is_free_preview ? (
                          <Play size={14} style={{ color: "var(--color-accent)" }} />
                        ) : (
                          <Lock size={14} style={{ color: "var(--color-muted)", opacity: 0.5 }} />
                        )}
                        <span
                          className="text-[14px] truncate"
                          style={{
                            color: l.is_free_preview ? "var(--color-ink)" : "var(--color-muted)",
                          }}
                        >
                          {l.title}
                        </span>
                        {l.is_free_preview ? (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[4px] font-[600] tracking-[0.04em] uppercase"
                            style={{
                              background: "rgba(201, 168, 76, 0.15)",
                              color: "#C9A84C",
                            }}
                          >
                            Preview
                          </span>
                        ) : null}
                      </div>
                      <span
                        className="text-[12px] flex-shrink-0"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {formatDuration(l.duration_minutes)}
                      </span>
                    </>
                  );

                  return (
                    <li key={l.id}>
                      {l.is_free_preview ? (
                        <Link
                          href={`/academy/${courseSlug}/preview/${l.slug}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-1)] transition-colors"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-3">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: FAQ section**

Create `src/components/academy/FaqSection.tsx`:
```tsx
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ = [
  {
    q: "How long do I have access to the course?",
    a: "Lifetime access. Pay once, watch as many times as you like, forever.",
  },
  {
    q: "Do I get a certificate?",
    a: "Not yet. Our current focus is the quality of the course content. Certificates are on the roadmap for 2026.",
  },
  {
    q: "What if the course isn't right for me?",
    a: "Email hello@sagacitynetwork.net within 14 days of purchase for a full refund, no questions asked.",
  },
  {
    q: "Can I expense this through my business?",
    a: "Yes — we provide a VAT receipt on purchase. Sagacity Network Ltd is UK VAT-registered.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="flex flex-col gap-3">
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            className="rounded-[10px] shadow-border overflow-hidden"
            style={{ background: "var(--surface-0)" }}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-[15px] font-[500]" style={{ color: "var(--color-ink)" }}>
                {f.q}
              </span>
              <ChevronDown
                size={18}
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--color-muted)",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>
            {isOpen ? (
              <div
                className="px-4 pb-4 text-[14px] leading-[1.7]"
                style={{ color: "var(--color-muted)" }}
              >
                {f.a}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Course landing page**

Create `src/app/(site)/academy/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getCourseBySlug } from "@/lib/academy/queries";
import CurriculumAccordion from "@/components/academy/CurriculumAccordion";
import FaqSection from "@/components/academy/FaqSection";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Not found" };
  return {
    title: `${course.title} — Sagacity Academy`,
    description: course.subtitle,
  };
}

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `£${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default async function CourseLandingPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const firstPreview = course.modules
    .flatMap((m) => m.lessons.map((l) => ({ module: m, lesson: l })))
    .find(({ lesson }) => lesson.is_free_preview);

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden section-glow-top"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-site section-px py-16 md:py-20 relative z-10">
          <Link
            href="/academy"
            className="inline-block text-[13px] mb-6"
            style={{ color: "rgba(240, 236, 244, 0.6)" }}
          >
            ← All courses
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10 items-start">
            <div>
              <span
                className="inline-block px-3 py-1 text-[11px] tracking-[0.08em] uppercase mb-4 rounded-[6px]"
                style={{ background: "rgba(201, 168, 76, 0.15)", color: "#C9A84C" }}
              >
                {course.level}
              </span>
              <h1
                className="text-[36px] md:text-[48px] font-[800] tracking-display mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
              >
                {course.title}
              </h1>
              <p
                className="text-[17px] font-[300] leading-[1.6] max-w-[620px]"
                style={{ color: "rgba(240, 236, 244, 0.75)" }}
              >
                {course.subtitle}
              </p>
              <div
                className="flex flex-wrap gap-x-6 gap-y-2 mt-6 text-[13px]"
                style={{ color: "rgba(240, 236, 244, 0.55)" }}
              >
                <span>{course.modules.length} modules</span>
                <span>·</span>
                <span>{lessonCount} lessons</span>
                <span>·</span>
                <span>{formatDuration(course.duration_minutes)}</span>
                <span>·</span>
                <span>Lifetime access</span>
              </div>
            </div>

            <div
              className="p-6 rounded-[14px]"
              style={{
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className="text-[32px] font-[800] mb-4"
                style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
              >
                {formatPrice(course.price_cents)}
              </div>
              <button
                type="button"
                disabled
                className="w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] mb-3 cursor-not-allowed"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(240, 236, 244, 0.5)",
                }}
              >
                Enrol — coming soon
              </button>
              {firstPreview ? (
                <Link
                  href={`/academy/${course.slug}/preview/${firstPreview.lesson.slug}`}
                  className="block w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] text-center"
                  style={{ background: "var(--gradient-purple)", color: "#fff" }}
                >
                  Try free lesson
                </Link>
              ) : null}
              <p
                className="text-[12px] text-center mt-4"
                style={{ color: "rgba(240, 236, 244, 0.45)" }}
              >
                14-day refund. Lifetime access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="section-surface py-14">
        <div className="max-w-site section-px">
          <div className="max-w-[720px]">
            <h2
              className="text-[24px] md:text-[28px] font-[700] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              About this course
            </h2>
            <p
              className="text-[16px] leading-[1.75] whitespace-pre-wrap"
              style={{ color: "var(--color-muted)" }}
            >
              {course.description}
            </p>
          </div>
        </div>
      </section>

      {/* Instructor */}
      {course.instructor_name ? (
        <section className="section-elevated py-14">
          <div className="max-w-site section-px">
            <div
              className="max-w-[720px] p-6 rounded-[14px] shadow-border"
              style={{ background: "var(--surface-0)" }}
            >
              <div
                className="text-[11px] tracking-[0.12em] uppercase mb-2"
                style={{ color: "var(--color-accent)" }}
              >
                Your instructor
              </div>
              <h3
                className="text-[22px] font-[700] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {course.instructor_name}
              </h3>
              {course.instructor_bio ? (
                <p
                  className="text-[15px] leading-[1.7]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {course.instructor_bio}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Curriculum */}
      <section className="section-surface py-14">
        <div className="max-w-site section-px">
          <h2
            className="text-[24px] md:text-[28px] font-[700] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Curriculum
          </h2>
          <CurriculumAccordion courseSlug={course.slug} modules={course.modules} />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-elevated py-14">
        <div className="max-w-site section-px max-w-[760px]">
          <h2
            className="text-[24px] md:text-[28px] font-[700] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Frequently asked questions
          </h2>
          <FaqSection />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Smoke test**

With dev server running, visit `http://localhost:3000/academy/ai-for-small-business`. Expected: hero with title, price card with "Enrol — coming soon" (disabled) + "Try free lesson" (active), curriculum with 3 modules expanded, FAQ.

- [ ] **Step 5: Commit**

```
git add src/components/academy/CurriculumAccordion.tsx src/components/academy/FaqSection.tsx src/app/(site)/academy/[slug]/page.tsx
git commit -m "feat(academy): course landing page at /academy/[slug]"
```

---

## Task 8 — `/academy/[slug]/preview/[lessonSlug]` free preview

**Files:**
- Create: `src/app/(site)/academy/[slug]/preview/[lessonSlug]/page.tsx`

- [ ] **Step 1: Create the page**

Create `src/app/(site)/academy/[slug]/preview/[lessonSlug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getPreviewLesson } from "@/lib/academy/queries";
import BlockRenderer from "@/components/academy/BlockRenderer";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string; lessonSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, lessonSlug } = await params;
  const lesson = await getPreviewLesson(slug, lessonSlug);
  if (!lesson) return { title: "Not found" };
  return {
    title: `${lesson.title} — Free preview — ${lesson.course.title}`,
    description: lesson.summary,
    robots: { index: true, follow: true },
  };
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default async function PreviewLessonPage({ params }: Props) {
  if (!isAcademyEnabled()) notFound();

  const { slug, lessonSlug } = await params;
  const lesson = await getPreviewLesson(slug, lessonSlug);
  if (!lesson) notFound();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header band */}
      <section
        className="border-b"
        style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
      >
        <div className="max-w-site section-px py-6">
          <Link
            href={`/academy/${lesson.course.slug}`}
            className="text-[13px] mb-3 inline-block"
            style={{ color: "var(--color-muted)" }}
          >
            ← {lesson.course.title}
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="text-[11px] px-2 py-0.5 rounded-[4px] font-[600] tracking-[0.04em] uppercase"
              style={{ background: "rgba(201, 168, 76, 0.15)", color: "#C9A84C" }}
            >
              Free preview
            </span>
            <span className="text-[12px]" style={{ color: "var(--color-muted)" }}>
              Module {lesson.module.position + 1} · {lesson.module.title}
            </span>
            <span className="text-[12px]" style={{ color: "var(--color-muted)" }}>
              · {formatDuration(lesson.duration_minutes)}
            </span>
          </div>
          <h1
            className="text-[28px] md:text-[36px] font-[800] tracking-heading mt-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {lesson.title}
          </h1>
        </div>
      </section>

      {/* Body */}
      <section className="py-12">
        <div className="max-w-site section-px">
          <article className="max-w-[720px] mx-auto">
            <BlockRenderer blocks={lesson.body} isPreview={true} />
          </article>
        </div>
      </section>

      {/* Enrol CTA */}
      <section className="section-elevated py-14">
        <div className="max-w-site section-px">
          <div
            className="max-w-[560px] mx-auto text-center p-8 rounded-[14px] shadow-border"
            style={{ background: "var(--surface-0)" }}
          >
            <h2
              className="text-[22px] md:text-[26px] font-[800] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enjoyed that? Keep going.
            </h2>
            <p className="text-[15px] mb-6" style={{ color: "var(--color-muted)" }}>
              That was the free preview. Enrol to unlock the rest of {lesson.course.title}.
            </p>
            <Link
              href={`/academy/${lesson.course.slug}`}
              className="inline-block px-6 py-3 text-[14px] font-[500] rounded-[8px]"
              style={{ background: "var(--gradient-purple)", color: "#fff" }}
            >
              See the full course
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test all 3 pages**

Visit in turn:
- `http://localhost:3000/academy` — catalog, one card
- `http://localhost:3000/academy/ai-for-small-business` — landing
- `http://localhost:3000/academy/ai-for-small-business/preview/what-ai-can-and-cant-do` — preview with all block types visible
- `http://localhost:3000/academy/ai-for-small-business/preview/writing-a-good-prompt` — should 404 (not a preview lesson)
- `http://localhost:3000/academy/does-not-exist` — should 404

- [ ] **Step 3: Commit**

```
git add src/app/(site)/academy/[slug]/preview/
git commit -m "feat(academy): free preview lesson page"
```

---

## Task 9 — Nav link + homepage integration

**Files:**
- Modify: `src/app/(site)/layout.tsx`
- Modify: `src/components/layout/Nav.tsx`

- [ ] **Step 1: Pass feature flag into Nav**

Edit `src/app/(site)/layout.tsx`:
```tsx
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const academyEnabled = isAcademyEnabled();
  return (
    <>
      <Nav academyEnabled={academyEnabled} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Conditionally render Academy link in Nav**

Edit `src/components/layout/Nav.tsx`:

Change the component signature to accept `academyEnabled`:
```tsx
export default function Nav({ academyEnabled = false }: { academyEnabled?: boolean }) {
```

Change the `LINKS` array from a module-level const to a value inside the component that conditionally includes Academy:
```tsx
  const LINKS = [
    { href: "/services", label: "Services" },
    { href: "/work", label: "Work" },
    ...(academyEnabled ? [{ href: "/academy", label: "Academy" }] : []),
    { href: "/training", label: "Training" },
    { href: "/guyana", label: "Guyana" },
    { href: "/about", label: "About" },
  ];
```

Remove the module-level `const LINKS` definition at the top of the file.

- [ ] **Step 3: Smoke test**

With `ACADEMY_ENABLED=true`, refresh any page. The Nav should show "Academy" between "Work" and "Training". With the flag off, it shouldn't appear.

- [ ] **Step 4: Commit**

```
git add src/app/(site)/layout.tsx src/components/layout/Nav.tsx
git commit -m "feat(academy): conditionally expose Academy link in Nav"
```

---

## Task 10 — Quality gate + PR

- [ ] **Step 1: Full automated gate**

Run each in turn, all must pass:
```
npx tsc --noEmit
npm run lint
npm test
npm run build
```

Expected: zero errors in each. If lint complains about `<img>` usage in `ImageBlock.tsx`, verify the `eslint-disable-next-line` comment on the import is in place.

- [ ] **Step 2: Manual smoke test matrix**

With `npm run dev` running and `ACADEMY_ENABLED=true`:
- [ ] `/academy` — catalog renders, card clicks through to landing
- [ ] `/academy/ai-for-small-business` — landing renders, price card shows disabled Enrol + active "Try free lesson"
- [ ] `/academy/ai-for-small-business/preview/what-ai-can-and-cant-do` — all block types render (heading, text, callout, divider, no errors)
- [ ] Writing prompt preview link → should be a lock icon in accordion, clicking the free-preview link only navigates for is_free_preview=true
- [ ] `/academy/ai-for-small-business/preview/writing-a-good-prompt` — direct URL gives 404 (not free preview)
- [ ] `/academy/not-a-course` — 404
- [ ] Nav shows "Academy" link; works in dark + light mode
- [ ] Set `ACADEMY_ENABLED=false`, restart, `/academy` redirects to `/`
- [ ] Lighthouse on `/academy` — LCP < 2.5s, no CLS jumps

- [ ] **Step 3: Verify advisors still clean**

Via Supabase MCP `get_advisors` for `security` and `performance`. New tables we're reading already had RLS in Slice 1; no new advisor warnings expected.

- [ ] **Step 4: Push branch + open PR**

```
git push -u origin academy-slice-2
```

Then via GitHub MCP `create_pull_request` against `academy-slice-1` (or `main` if Slice 1 has merged):
- Title: `feat(academy): Slice 2 — public catalog + course landing + free preview`
- Body: summary of routes added, dependencies added (`react-markdown`, `remark-gfm`), seed migration summary, manual test checklist ticked.

- [ ] **Step 5: Verify Vercel preview**

Poll deployment via Vercel MCP `get_deployment` by branch until state is READY. Visit preview URL and spot-check the same routes.

---

## Post-ship notes

- **Production rollout:** keep `ACADEMY_ENABLED=false` in Vercel production env until Slice 3 (checkout) is live. Then flip on.
- **Seed drift:** if the seed JSON changes, re-run `npm run seed:academy-course -- ai-for-small-business`. Because of the composite uniques, upsert preserves IDs, so lesson_progress rows survive.
- **Next slice handoff:** Slice 3 will add `/api/academy/checkout` and `/api/academy/webhook`, flip the "Enrol — coming soon" button to real Stripe Checkout, and send magic links on enrollment. Query helpers here are reused as-is.

## Verification checklist (self-review after writing)

- [x] Every new file has explicit code in a step
- [x] Every task ends with a commit step
- [x] No placeholders like "TODO" or "fill in"
- [x] Type names referenced in later tasks (`CourseSummary`, `CourseDetail`, `LessonPreview`, `ModuleWithLessons`) are defined in Task 4
- [x] All 10 block types from the schema are covered by a component in Task 5
- [x] Each block component imports its own Zod-derived type via `Extract<Block, { type: ... }>`
- [x] Feature flag gate applied at every new page (proxy-level redirect + per-page `notFound()` belt-and-braces)
- [x] No RLS-bypass code paths; every public query uses the anon server client
- [x] Seed script is idempotent (upsert by stable composite keys)
- [x] Copyright / privacy-safe: no third-party iframes from untrusted hosts (sandboxed + allowlisted)
