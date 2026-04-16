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
    `\u2713 Seeded "${seed.course.title}" (${seed.modules.length} modules, ${lessonCount} lessons). Status: ${existing?.status ?? "draft"}`
  );
  console.log(`  Edit in DB to publish when ready.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
