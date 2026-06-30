-- ============================================
-- Enable RLS on all tables (idempotent — safe even if already on)
-- ============================================
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.milestones enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

-- ============================================
-- Helper function: is the current user an admin?
-- Avoids repeating a subquery in every policy below.
-- ============================================
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================
-- PROFILES
-- ============================================
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- COURSES
-- ============================================
create policy "Anyone can read published courses"
  on public.courses for select
  using (is_published = true);

create policy "Admins can read all courses"
  on public.courses for select
  using (public.is_admin());

create policy "Admins can insert courses"
  on public.courses for insert
  with check (public.is_admin());

create policy "Admins can update courses"
  on public.courses for update
  using (public.is_admin());

create policy "Admins can delete courses"
  on public.courses for delete
  using (public.is_admin());

-- ============================================
-- MILESTONES
-- ============================================
create policy "Anyone can read milestones of published courses"
  on public.milestones for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = milestones.course_id
      and courses.is_published = true
    )
  );

create policy "Admins can read all milestones"
  on public.milestones for select
  using (public.is_admin());

create policy "Admins can insert milestones"
  on public.milestones for insert
  with check (public.is_admin());

create policy "Admins can update milestones"
  on public.milestones for update
  using (public.is_admin());

create policy "Admins can delete milestones"
  on public.milestones for delete
  using (public.is_admin());

-- ============================================
-- LESSONS
-- Students must be enrolled in the parent course to read lesson content.
-- ============================================
create policy "Enrolled students can read lessons"
  on public.lessons for select
  using (
    exists (
      select 1
      from public.milestones m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = lessons.milestone_id
      and e.student_id = auth.uid()
    )
  );

create policy "Admins can read all lessons"
  on public.lessons for select
  using (public.is_admin());

create policy "Admins can insert lessons"
  on public.lessons for insert
  with check (public.is_admin());

create policy "Admins can update lessons"
  on public.lessons for update
  using (public.is_admin());

create policy "Admins can delete lessons"
  on public.lessons for delete
  using (public.is_admin());

-- ============================================
-- ENROLLMENTS
-- ============================================
create policy "Students can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

create policy "Admins can read all enrollments"
  on public.enrollments for select
  using (public.is_admin());

create policy "Students can enroll themselves"
  on public.enrollments for insert
  with check (auth.uid() = student_id);

create policy "Students can unenroll themselves"
  on public.enrollments for delete
  using (auth.uid() = student_id);

-- ============================================
-- LESSON PROGRESS
-- ============================================
create policy "Students can read own progress"
  on public.lesson_progress for select
  using (auth.uid() = student_id);

create policy "Admins can read all progress"
  on public.lesson_progress for select
  using (public.is_admin());

create policy "Students can mark own progress"
  on public.lesson_progress for insert
  with check (auth.uid() = student_id);

create policy "Students can delete own progress"
  on public.lesson_progress for delete
  using (auth.uid() = student_id);