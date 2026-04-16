-- Academy Slice 3 — checkout, enrolment, progress, paid-content gating.
-- Additive only. Safe to apply to an environment that already has
-- Slice 1/2 tables.
--
-- Existing enrollments schema (from Slice 1): id, user_id, course_id, source,
-- stripe_session_id, granted_by, enrolled_at. No status column yet.
-- We reuse `stripe_session_id` for the Stripe Checkout Session id (rather
-- than introducing a parallel `stripe_checkout_session_id` column).

-- 1. enrollments: add missing columns
alter table public.enrollments
  add column if not exists status text not null default 'active',
  add column if not exists stripe_customer_id text,
  add column if not exists amount_paid_cents integer;

-- Unique index on stripe_session_id when present (idempotency anchor for
-- the webhook).
create unique index if not exists enrollments_stripe_session_unique
  on public.enrollments (stripe_session_id)
  where stripe_session_id is not null;

-- 2. enrollments status check constraint
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

-- Not exposed to anon/authenticated. Service role bypasses RLS.
alter table public.stripe_webhook_events enable row level security;

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
