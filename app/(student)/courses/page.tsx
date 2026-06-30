import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CourseCard from "@/components/student/CourseCard"
import { BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Courses" }

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const { category, difficulty } = params

  // Fetch all published courses
  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (difficulty) query = query.eq("difficulty", difficulty)
  if (category) query = query.eq("category", category)

  const { data: courses } = await query

  // Fetch student's enrollments to mark enrolled courses
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", user.id)

  const enrolledIds = new Set((enrollments || []).map((e) => e.course_id))

  // Get milestone counts for each course
  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: milestoneCount } = await supabase
        .from("milestones")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      return {
        ...course,
        milestone_count: milestoneCount || 0,
        lesson_count: 0,
      }
    })
  )

  // Get unique categories for filter
  const { data: allCourses } = await supabase
    .from("courses")
    .select("category")
    .eq("is_published", true)

  const categories = [...new Set((allCourses || []).map((c) => c.category))]

  const difficulties = ["beginner", "intermediate", "advanced"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          {coursesWithStats.length} course{coursesWithStats.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <a href="/courses">
          <Badge
            variant={!difficulty && !category ? "default" : "outline"}
            className="cursor-pointer text-sm py-1 px-3"
          >
            All
          </Badge>
        </a>
        {difficulties.map((d) => (
          <a key={d} href={`/courses?difficulty=${d}`}>
            <Badge
              variant={difficulty === d ? "default" : "outline"}
              className="cursor-pointer text-sm py-1 px-3 capitalize"
            >
              {d}
            </Badge>
          </a>
        ))}
        {categories.map((cat) => (
          <a key={cat} href={`/courses?category=${encodeURIComponent(cat)}`}>
            <Badge
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer text-sm py-1 px-3"
            >
              {cat}
            </Badge>
          </a>
        ))}
      </div>

      {/* Grid */}
      {coursesWithStats.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">Try a different filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {coursesWithStats.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrolled={enrolledIds.has(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}