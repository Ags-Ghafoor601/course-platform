import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Trophy, Flame, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CourseCard from "@/components/student/CourseCard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch enrollments with course data
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses (
        id, title, description, thumbnail_url,
        category, difficulty, is_published,
        instructor_name, created_by, created_at, updated_at
      )
    `)
    .eq("student_id", user.id)

  // Fetch milestone/lesson counts for enrolled courses
  const enrolledCourses = await Promise.all(
    (enrollments || []).map(async (enrollment) => {
      const course = enrollment.course as any

      const { count: milestoneCount } = await supabase
        .from("milestones")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: milestones } = await supabase
        .from("milestones")
        .select("id")
        .eq("course_id", course.id)

      const milestoneIds = (milestones || []).map((m: any) => m.id)

      // Fetch lesson IDs and durations together in one query
      const { data: lessonRows } = await supabase
        .from("lessons")
        .select("id, duration_minutes")
        .in("milestone_id", milestoneIds.length > 0 ? milestoneIds : [""])

      const lessonIds = (lessonRows || []).map((l: any) => l.id)
      const lessonCount = lessonIds.length
      const totalMinutes = (lessonRows || []).reduce(
        (sum: number, l: any) => sum + (l.duration_minutes || 0),
        0
      )

      const { count: completedCount } = await supabase
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("student_id", user.id)
        .in("lesson_id", lessonIds.length > 0 ? lessonIds : [""])

      const progress =
        lessonCount && lessonCount > 0
          ? Math.round(((completedCount || 0) / lessonCount) * 100)
          : 0

      return {
        ...course,
        milestone_count: milestoneCount || 0,
        lesson_count: lessonCount,
        total_minutes: totalMinutes,
        progress,
      }
    })
  )

  const totalCompleted = enrolledCourses.filter((c) => c.progress === 100).length
  const inProgress = enrolledCourses.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{enrolledCourses.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{inProgress}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCompleted}</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses" className="flex items-center gap-1">
              Browse more <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Browse the catalog and enroll in your first course.
            </p>
            <Button asChild>
              <Link href="/courses">Browse courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrolled
                progress={course.progress}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}