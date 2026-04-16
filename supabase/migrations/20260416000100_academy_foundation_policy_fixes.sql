-- Academy Slice 1 — Foundation policy fixes
-- Applied after 20260416000000_academy_foundation.sql.
--
-- Fixes surfaced during code review:
--   1. lessons enrolled read — add published-course guard (defense-in-depth)
--      so enrolled users lose read access if a course is un-published.
--   2. quiz_attempts — split overly-permissive "for all" policy into
--      separate insert and select policies. Attempts are now immutable
--      once submitted (no updates, no deletes from the user session).
--      Retry semantics remain intact: a new attempt is a new row.
--   3. Add index on academy_audit_log.actor_id for admin audit queries.
--
-- Inverse (documented, not automated):
--   drop policy if exists "quiz_attempts user insert own" on public.quiz_attempts;
--   drop policy if exists "quiz_attempts user read own" on public.quiz_attempts;
--   create policy "quiz_attempts user rw own" on public.quiz_attempts
--     for all to authenticated
--     using (user_id = auth.uid()) with check (user_id = auth.uid());
--   drop policy if exists "lessons enrolled read" on public.lessons;
--   create policy "lessons enrolled read" on public.lessons for select
--     to authenticated using (
--       exists (
--         select 1 from public.modules m
--         join public.enrollments e on e.course_id = m.course_id
--         where m.id = lessons.module_id and e.user_id = auth.uid()
--       )
--     );
--   drop index if exists public.academy_audit_log_actor_idx;

-- ─ 1. lessons enrolled read — add published-course guard ──────────

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
        and e.user_id = auth.uid()
        and c.status = 'published'
    )
  );

-- ─ 2. quiz_attempts — split rw into insert + select ────────────────

drop policy if exists "quiz_attempts user rw own" on public.quiz_attempts;

create policy "quiz_attempts user insert own" on public.quiz_attempts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "quiz_attempts user read own" on public.quiz_attempts
  for select
  to authenticated
  using (user_id = auth.uid());

-- ─ 3. Index actor_id on academy_audit_log ─────────────────────────

create index if not exists academy_audit_log_actor_idx
  on public.academy_audit_log(actor_id);
