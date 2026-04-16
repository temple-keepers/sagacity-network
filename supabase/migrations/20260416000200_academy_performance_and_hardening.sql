-- Academy Slice 1 — Performance + security hardening
-- Applied after 20260416000100_academy_foundation_policy_fixes.sql.
--
-- Fixes surfaced during Slice 1 final code review (Supabase advisor + manual):
--
--   1. RLS auth.uid() re-evaluation (PERFORMANCE CRITICAL)
--      Bare `auth.uid()` in a USING/WITH CHECK clause re-evaluates per row.
--      Wrapping in `(select auth.uid())` lets Postgres cache it for the
--      whole statement. Affects every authenticated-user policy.
--
--   2. public.set_updated_at() search_path hardening (SECURITY)
--      Function had a mutable search_path, allowing a search-path hijack if
--      an attacker could create objects in a higher-priority schema. Fix by
--      pinning `SET search_path = ''` and fully qualifying `now()`.
--
--   3. Foreign-key indexes (PERFORMANCE)
--      Four FKs were unindexed. Aggregations like "how many students enrolled
--      in course X" or "who attempted quiz Y" would seq-scan at scale.
--
-- Inverse (documented, not automated):
--   See notes at end of file.

-- ── 1. RLS auth.uid() caching ──────────────────────────────────────

-- enrollments: user_read_own
drop policy if exists "enrollments user read own" on public.enrollments;
create policy "enrollments user read own" on public.enrollments
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- lesson_progress: user_rw_own
drop policy if exists "lesson_progress user rw own" on public.lesson_progress;
create policy "lesson_progress user rw own" on public.lesson_progress
  for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- lessons: enrolled_read (re-issued from 000100 with cached auth.uid())
drop policy if exists "lessons enrolled read" on public.lessons;
create policy "lessons enrolled read" on public.lessons
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      join public.enrollments e on e.course_id = m.course_id
      where m.id = lessons.module_id
        and e.user_id = (select auth.uid())
        and c.status = 'published'
    )
  );

-- quiz_attempts: user_insert_own + user_read_own
drop policy if exists "quiz_attempts user insert own" on public.quiz_attempts;
create policy "quiz_attempts user insert own" on public.quiz_attempts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "quiz_attempts user read own" on public.quiz_attempts;
create policy "quiz_attempts user read own" on public.quiz_attempts
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ── 2. set_updated_at() search_path hardening ──────────────────────

create or replace function public.set_updated_at() returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

-- ── 3. Foreign-key indexes ─────────────────────────────────────────

create index if not exists enrollments_course_idx
  on public.enrollments(course_id);

create index if not exists enrollments_granted_by_idx
  on public.enrollments(granted_by);

create index if not exists lesson_progress_lesson_idx
  on public.lesson_progress(lesson_id);

create index if not exists quiz_attempts_lesson_idx
  on public.quiz_attempts(lesson_id);

-- ── Inverse (documented, not automated) ────────────────────────────
-- drop index if exists public.quiz_attempts_lesson_idx;
-- drop index if exists public.lesson_progress_lesson_idx;
-- drop index if exists public.enrollments_granted_by_idx;
-- drop index if exists public.enrollments_course_idx;
--
-- Restore set_updated_at() from 20260416000000:
-- create or replace function public.set_updated_at() returns trigger language plpgsql as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$;
--
-- RLS policies: re-run 20260416000100 then 20260416000000 snippets to get
-- back the bare auth.uid() forms (not recommended — the cached form is
-- semantically identical and strictly faster).
