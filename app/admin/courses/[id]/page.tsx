import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CourseForm from "@/components/admin/CourseForm"
import MilestoneEditor from "@/components/admin/MilestoneEditor"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye } from "lucide-react"
import PublishToggle from "@/components/admin/PublishToggle"

export default async function EditCoursePage({
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

  const milestonesWithSortedLessons = (milestones || []).map((m) => ({
    ...m,
    lessons: [...(m.lessons || [])].sort((a, b) => a.order_index - b.order_index),
  }))

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground mt-1 line-clamp-1">{course.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PublishToggle courseId={course.id} isPublished={course.is_published} />
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/courses/${course.id}/preview`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Course details form */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Course Details</h2>
        <CourseForm course={course} />
      </div>

      {/* Milestone editor */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Course Content</h2>
        <MilestoneEditor
          courseId={course.id}
          initialMilestones={milestonesWithSortedLessons}
        />
      </div>
    </div>
  )
}