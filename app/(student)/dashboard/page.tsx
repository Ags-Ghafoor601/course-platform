import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  BookOpen,
  Trophy,
  Flame,
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle2,
  Play,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import CourseCard from "@/components/student/CourseCard"
import { formatDuration } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`*, course:courses (*)`)
    .eq("student_id", user.id)

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
        lessonCount > 0
          ? Math.round(((completedCount || 0) / lessonCount) * 100)
          : 0

      return {
        ...course,
        milestone_count: milestoneCount || 0,
        lesson_count: lessonCount,
        total_minutes: totalMinutes,
        completed_count: completedCount || 0,
        progress,
      }
    })
  )

  // Sort: in-progress first, not started second, completed last
  const sortedCourses = [...enrolledCourses].sort((a, b) => {
    const order = (p: number) =>
      p > 0 && p < 100 ? 0 : p === 0 ? 1 : 2
    return order(a.progress) - order(b.progress)
  })

  const inProgressCourses = enrolledCourses.filter(
    (c) => c.progress > 0 && c.progress < 100
  )
  const completedCourses = enrolledCourses.filter((c) => c.progress === 100)
  const notStartedCourses = enrolledCourses.filter((c) => c.progress === 0)

  // Featured = most recently active in-progress course
  const featuredCourse = inProgressCourses[0] ?? null

  const firstName = profile?.full_name?.split(" ")[0] || "there"

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  const stats = [
    {
      label: "Enrolled",
      value: enrolledCourses.length,
      icon: BookOpen,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      desc: "total courses",
    },
    {
      label: "In Progress",
      value: inProgressCourses.length,
      icon: Flame,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      desc: "active now",
    },
    {
      label: "Completed",
      value: completedCourses.length,
      icon: Trophy,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
      desc: "courses done",
    },
    {
      label: "Not Started",
      value: notStartedCourses.length,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      desc: "ready to begin",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">
            {greeting} 👋
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            {firstName}
          </h1>
          <p className="text-muted-foreground mt-1">
            {inProgressCourses.length > 0
              ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? "s" : ""} in progress. Keep it up!`
              : completedCourses.length > 0
              ? `You've completed ${completedCourses.length} course${completedCourses.length > 1 ? "s" : ""}. Outstanding!`
              : enrolledCourses.length > 0
              ? "You're enrolled but haven't started yet. Begin today!"
              : "Start your learning journey by enrolling in a course."}
          </p>
        </div>
        <Button asChild className="flex-shrink-0">
          <Link href="/courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Browse courses
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg, desc }) => (
          <Card
            key={label}
            className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <div
                className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Featured in-progress course */}
      {featuredCourse && (
        <Card className="border-primary/30 bg-gradient-to-r from-primary/8 via-primary/4 to-background overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-primary">
                    <Flame className="h-4 w-4" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Continue learning
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {featuredCourse.difficulty}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold text-foreground truncate">
                  {featuredCourse.title}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {featuredCourse.completed_count} of{" "}
                      {featuredCourse.lesson_count} lessons complete
                    </span>
                    <span className="font-semibold text-primary">
                      {featuredCourse.progress}%
                    </span>
                  </div>
                  <Progress value={featuredCourse.progress} className="h-2" />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5" />
                    {featuredCourse.milestone_count} milestones
                  </span>
                  {featuredCourse.total_minutes > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(featuredCourse.total_minutes)} total
                    </span>
                  )}
                </div>
              </div>
              <Button asChild size="lg" className="flex-shrink-0 gap-2">
                <Link href={`/courses/${featuredCourse.id}`}>
                  <Play className="h-4 w-4" />
                  Continue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">My Courses</h2>
            {enrolledCourses.length > 0 && (
              <Badge variant="secondary">{enrolledCourses.length}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses" className="flex items-center gap-1 text-sm">
              Browse more
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Your learning journey starts here
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm leading-relaxed">
                Browse our course catalog and enroll in your first course to
                start tracking your progress.
              </p>
              <Button asChild>
                <Link href="/courses">Browse courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {sortedCourses.map((course) => (
              <div key={course.id} className="relative">
                {/* Status indicator */}
                {course.progress === 100 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-yellow-500 text-white rounded-full p-1 shadow-md">
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
                {course.progress > 0 && course.progress < 100 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-orange-500 text-white rounded-full p-1 shadow-md">
                      <Flame className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
                <CourseCard
                  course={course}
                  enrolled
                  progress={course.progress}
                />
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        {enrolledCourses.length > 0 && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                <Flame className="h-2.5 w-2.5 text-white" />
              </span>
              In progress
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                <Trophy className="h-2.5 w-2.5 text-white" />
              </span>
              Completed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              Not started
            </span>
          </div>
        )}
      </div>
    </div>
  )
}