import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import PublishToggle from "@/components/admin/PublishToggle"
import DeleteCourseButton from "@/components/admin/DeleteCourseButton"
import { BookOpen, Plus, Pencil, Eye, BarChart3, Users } from "lucide-react"

export const metadata = { title: "Manage Courses" }

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false })

  const coursesWithCounts = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: milestoneCount } = await supabase
        .from("milestones")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { count: enrollmentCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      return { ...course, milestoneCount, enrollmentCount }
    })
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-1">
            {coursesWithCounts.length} course{coursesWithCounts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

      {coursesWithCounts.length === 0 ? (
        <Card className="p-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first course to get started.
          </p>
          <Button asChild>
            <Link href="/admin/courses/new">
              <Plus className="h-4 w-4 mr-2" />
              Create course
            </Link>
          </Button>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            {/* Desktop header — hidden on mobile */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="col-span-5">Course</span>
              <span className="col-span-2 text-center">Milestones</span>
              <span className="col-span-2 text-center">Enrolled</span>
              <span className="col-span-1 text-center">Status</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>

            {coursesWithCounts.map((course) => (
              <div key={course.id} className="hover:bg-accent/30 transition-colors">

                {/* Mobile card layout */}
                <div className="md:hidden p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm leading-snug">{course.title}</p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {course.category} · {course.difficulty}
                        </p>
                      </div>
                    </div>
                    <PublishToggle
                      courseId={course.id}
                      isPublished={course.is_published}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        {course.milestoneCount || 0} milestones
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {course.enrollmentCount || 0} enrolled
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/courses/${course.id}/preview`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link href={`/admin/courses/${course.id}`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                    </div>
                  </div>
                </div>

                {/* Desktop row layout */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 py-4 items-center">
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {course.category} · {course.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-medium">{course.milestoneCount || 0}</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm font-medium">{course.enrollmentCount || 0}</span>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <PublishToggle courseId={course.id} isPublished={course.is_published} />
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild title="Preview">
                      <Link href={`/admin/courses/${course.id}/preview`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild title="Edit">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
                  </div>
                </div>

              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}