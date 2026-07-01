import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { BookOpen, Clock, BarChart3, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { formatDuration } from "@/lib/utils"

export default async function CoursePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single()

  if (!course) notFound()

  const { data: milestones } = await supabase
    .from("milestones")
    .select(`*, lessons (*)`)
    .eq("course_id", id)
    .order("order_index")

  const allLessons = (milestones || []).flatMap((m) => m.lessons || [])
  const totalMinutes = allLessons.reduce((sum, l) => sum + (l.duration_minutes || 0), 0)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back + status */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/admin/courses/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to editor
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">Preview mode</Badge>
          <Badge variant={course.is_published ? "default" : "secondary"}>
            {course.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Course hero */}
      <div className="space-y-3">
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
            {allLessons.length} lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDuration(totalMinutes)}
          </span>
          <span>By {course.instructor_name}</span>
        </div>
      </div>

      {/* Enroll card preview */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <p className="font-medium">Ready to start?</p>
            <p className="text-sm text-muted-foreground">
              Enroll to access all {allLessons.length} lessons
            </p>
          </div>
          <Button disabled>Enroll now (preview)</Button>
        </CardContent>
      </Card>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Course Content</h2>
        {(milestones || []).length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground text-sm">
              No milestones added yet.{" "}
              <Link
                href={`/admin/courses/${id}`}
                className="text-primary hover:underline"
              >
                Add milestones in the editor.
              </Link>
            </p>
          </Card>
        ) : (
          (milestones || []).map((milestone, mIdx) => {
            const lessons = [...(milestone.lessons || [])].sort(
              (a, b) => a.order_index - b.order_index
            )
            return (
              <Card key={milestone.id} className="overflow-hidden">
                <div className="flex items-center gap-3 p-4 bg-muted/50 border-b border-border">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-background border-2 border-border text-xs font-bold text-muted-foreground">
                    {mIdx + 1}
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
                  {lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm flex-1">{lesson.title}</span>
                      {lesson.duration_minutes > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {lesson.duration_minutes}m
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}