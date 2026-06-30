export type Role = "student" | "admin"
export type Difficulty = "beginner" | "intermediate" | "advanced"

export interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  category: string
  difficulty: Difficulty
  is_published: boolean
  instructor_name: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  milestone_id: string
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number
  order_index: number
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
}

export interface LessonProgress {
  id: string
  student_id: string
  lesson_id: string
  completed_at: string
}

export interface CourseWithStats extends Course {
  milestone_count?: number
  lesson_count?: number
  enrollment_count?: number
}

export interface MilestoneWithLessons extends Milestone {
  lessons: Lesson[]
}

export interface CourseWithMilestones extends Course {
  milestones: MilestoneWithLessons[]
}

export interface EnrollmentWithCourse extends Enrollment {
  course: Course
}