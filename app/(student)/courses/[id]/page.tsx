import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Clock, BarChart3, CheckCircle2, Circle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import EnrollButton from "@/components/student/EnrollButton"
import { formatDuration } from "@/lib/utils"

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Fetch course
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (!course) notFound()

  // Fetch milestones with lessons
  const { data: milestones } = await supabase
    .from("milestones")
    .select(`*, lessons (*)`)
    .eq("course_id", id)
    .order("order_index")

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", id)
    .single()

  const isEnrolled = !!enrollment

  // Fetch progress if enrolled
  let completedLessonIds = new Set<string>()
  if (isEnrolled) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("student_id", user.id)

    completedLessonIds = new Set((progress || []).map((p) => p.lesson_id))
  }

  const allLessons = (milestones || []).flatMap((m) => m.lessons || [])
  const totalLessons = allLessons.length
  const totalMinutes = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)
  const completedCount = allLessons.filter((l) => completedLessonIds.has(l.id)).length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {course.difficulty}
          </Badge>
          <Badge variant="outline">{course.category}</Badge>
        </div>
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <p className="text-muted-foreground text-lg">{course.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            {(milestones || []).length} milestones
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {totalLessons} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(totalMinutes)}
          </span>
          <span>By {course.instructor_name}</span>
        </div>
      </div>

      {/* Enrollment card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-6">
          {isEnrolled ? (
            <div className="flex items-center justify-between w-full gap-4">
              <div className="space-y-1 flex-1">
                <p className="font-medium">Your progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-primary whitespace-nowrap">
                    {completedCount}/{totalLessons} lessons
                  </span>
                </div>
              </div>
              {allLessons[0] && (
                <Button asChild>
                  <a href={`/learn/${course.id}/${allLessons[0].id}`}>
                    {completedCount > 0 ? "Continue" : "Start learning"}
                  </a>
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="font-medium">Ready to start?</p>
                <p className="text-sm text-muted-foreground">
                  Enroll to access all {totalLessons} lessons
                </p>
              </div>
              <EnrollButton courseId={course.id} studentId={user.id} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Milestones accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>
        {(milestones || []).map((milestone, mIndex) => {
          const lessons = [...(milestone.lessons || [])].sort(
            (a, b) => a.order_index - b.order_index
          )
          const milestoneCompleted = lessons.every((l) =>
            completedLessonIds.has(l.id)
          )

          return (
            <Card key={milestone.id} className="overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-muted/50 border-b border-border">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${milestoneCompleted ? "bg-primary text-primary-foreground" : "bg-background border-2 border-border text-muted-foreground"}`}>
                  {milestoneCompleted ? "✓" : mIndex + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-xs text-muted-foreground">
                      {milestone.description}
                    </p>
                  )}
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  {lessons.length} lessons
                </span>
              </div>
              <div className="divide-y divide-border">
                {lessons.map((lesson) => {
                  const done = completedLessonIds.has(lesson.id)
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      {isEnrolled ? (
                        <a
                          href={`/learn/${course.id}/${lesson.id}`}
                          className="text-sm hover:text-primary transition-colors flex-1"
                        >
                          {lesson.title}
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground flex-1">
                          {lesson.title}
                        </span>
                      )}
                      {lesson.duration_minutes > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration_minutes}m
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}