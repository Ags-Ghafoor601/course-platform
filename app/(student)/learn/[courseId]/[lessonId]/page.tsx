import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import LessonContent from "@/components/student/LessonContent"
import MarkLessonDone from "@/components/student/MarkLessonDone"
import LessonSidebar from "@/components/student/LessonSidebar"
import Link from "next/link"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("student_id", user.id)
    .eq("course_id", courseId)
    .single()

  if (!enrollment) redirect(`/courses/${courseId}`)

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single()

  if (!course) notFound()

  const { data: milestones } = await supabase
    .from("milestones")
    .select(`*, lessons (*)`)
    .eq("course_id", courseId)
    .order("order_index")

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single()

  if (!lesson) notFound()

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("student_id", user.id)

  const completedIds = new Set((progress || []).map((p) => p.lesson_id))
  const isCompleted = completedIds.has(lessonId)

  const allLessons = (milestones || []).flatMap((m) =>
    [...(m.lessons || [])].sort((a, b) => a.order_index - b.order_index)
  )
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const totalLessons = allLessons.length
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length
  const progressPercent = Math.round((completedCount / totalLessons) * 100)

  return (
    <div className="relative">
      {/* Mobile lesson list sidebar (client toggle) */}
      <LessonSidebar
        courseId={courseId}
        courseTitle={course.title}
        milestones={milestones || []}
        currentLessonId={lessonId}
        completedIds={[...completedIds]}
        completedCount={completedCount}
        totalLessons={totalLessons}
        progressPercent={progressPercent}
      />

      {/* Main layout */}
      <div className="flex gap-8 max-w-7xl mx-auto">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 space-y-3">
            <div>
              <Link
                href={`/courses/${courseId}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                {course.title}
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {completedCount}/{totalLessons} completed
                </span>
                <span className="text-xs font-medium text-primary">
                  {progressPercent}%
                </span>
              </div>
              <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
              {(milestones || []).map((milestone, mIdx) => {
                const lessons = [...(milestone.lessons || [])].sort(
                  (a, b) => a.order_index - b.order_index
                )
                return (
                  <div key={milestone.id}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                      {mIdx + 1}. {milestone.title}
                    </p>
                    {lessons.map((l) => {
                      const done = completedIds.has(l.id)
                      const active = l.id === lessonId
                      return (
                        <Link
                          key={l.id}
                          href={`/learn/${courseId}/${l.id}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground"
                              : done
                              ? "text-muted-foreground hover:bg-accent"
                              : "hover:bg-accent"
                          }`}
                        >
                          {done && !active ? (
                            <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                          ) : (
                            <span className="h-3.5 w-3.5 flex-shrink-0" />
                          )}
                          <span className="line-clamp-1">{l.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6 pb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                Lesson {currentIndex + 1} of {totalLessons}
              </Badge>
              {isCompleted && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold">{lesson.title}</h1>
          </div>

          {lesson.video_url && (
            <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-lg">
              <iframe
                src={lesson.video_url}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <LessonContent content={lesson.content || ""} />

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevLesson}
              asChild={!!prevLesson}
            >
              {prevLesson ? (
                <Link href={`/learn/${courseId}/${prevLesson.id}`}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </span>
              )}
            </Button>

            <MarkLessonDone
              lessonId={lessonId}
              studentId={user.id}
              isCompleted={isCompleted}
              nextLessonId={nextLesson?.id}
              courseId={courseId}
            />

            <Button
              variant="outline"
              size="sm"
              disabled={!nextLesson}
              asChild={!!nextLesson}
            >
              {nextLesson ? (
                <Link href={`/learn/${courseId}/${nextLesson.id}`}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              ) : (
                <span>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}