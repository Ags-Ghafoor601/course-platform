-- ============================================
-- LearnPath: Initial Schema
-- Tables: profiles, courses, milestones, lessons, enrollments, lesson_progress
-- ============================================

-- Profiles table — extends auth.users with app-specific data
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

-- Courses table
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  thumbnail_url text,
  category text not null default 'General',
  difficulty text not null default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  is_published boolean not null default false,
  instructor_name text not null default '',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Milestones table — belongs to a course
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Lessons table — belongs to a milestone
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  title text not null,
  content text,
  video_url text,
  duration_minutes integer not null default 0,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Enrollments table — student joins a course
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

-- Lesson progress table — tracks completion per student per lesson
create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

-- ============================================
-- Indexes for common query patterns
-- ============================================
create index idx_courses_published on public.courses(is_published);
create index idx_courses_created_by on public.courses(created_by);
create index idx_milestones_course on public.milestones(course_id, order_index);
create index idx_lessons_milestone on public.lessons(milestone_id, order_index);
create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_progress_student on public.lesson_progress(student_id);
create index idx_progress_lesson on public.lesson_progress(lesson_id);