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

-- ─ 4. enrollments ─────────────────────────────────────────────────

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

-- ─ 5. lessons ─────────────────────────────────────────────────────

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
