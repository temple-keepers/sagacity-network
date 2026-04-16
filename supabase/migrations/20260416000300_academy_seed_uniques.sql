-- Adds the composite unique constraint the course-seed script relies on for
-- idempotent module upsert. Safe additive change: pre-existing rows already
-- satisfy uniqueness (modules are scoped per course, and position values
-- within a course are already unique by convention).
--
-- lessons (module_id, slug) unique already exists in the foundation migration.

alter table public.modules
  add constraint modules_course_position_unique unique (course_id, position);
