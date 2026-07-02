import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CourseCard from "@/components/student/CourseCard"
import { BookOpen, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Courses" }

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string; q?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const { category, difficulty, q } = params

  let query = supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (difficulty) query = query.eq("difficulty", difficulty)
  if (category) query = query.eq("category", category)
  if (q) query = query.ilike("title", `%${q}%`)

  const { data: courses } = await query

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("course_id")
    .eq("student_id", user.id)

  const enrolledIds = new Set((enrollments || []).map((e) => e.course_id))

  const coursesWithStats = await Promise.all(
    (courses || []).map(async (course) => {
      const { count: milestoneCount } = await supabase
        .from("milestones")
        .select("*", { count: "exact", head: true })
        .eq("course_id", course.id)

      const { data: milestoneRows } = await supabase
        .from("milestones")
        .select("id")
        .eq("course_id", course.id)

      const milestoneIds = (milestoneRows || []).map((m) => m.id)

      const { data: lessonRows } = await supabase
        .from("lessons")
        .select("id, duration_minutes")
        .in("milestone_id", milestoneIds.length > 0 ? milestoneIds : [""])

      const lessonCount = (lessonRows || []).length
      const totalMinutes = (lessonRows || []).reduce(
        (sum, l) => sum + (l.duration_minutes || 0),
        0
      )

      return {
        ...course,
        milestone_count: milestoneCount || 0,
        lesson_count: lessonCount,
        total_minutes: totalMinutes,
      }
    })
  )

  const { data: allCourses } = await supabase
    .from("courses")
    .select("category, difficulty")
    .eq("is_published", true)

  const categories = [...new Set((allCourses || []).map((c) => c.category))]
  const difficulties = ["beginner", "intermediate", "advanced"]

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const base: Record<string, string> = {}
    if (q) base.q = q
    if (category) base.category = category
    if (difficulty) base.difficulty = difficulty
    Object.assign(base, overrides)
    Object.keys(base).forEach((k) => base[k] === undefined && delete base[k])
    const qs = new URLSearchParams(base).toString()
    return `/courses${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground mt-1">
          {coursesWithStats.length} course{coursesWithStats.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <form method="GET" action="/courses">
          {category && <input type="hidden" name="category" value={category} />}
          {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
          <Input
            name="q"
            placeholder="Search courses..."
            defaultValue={q || ""}
            className="pl-9"
          />
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <a href={buildUrl({ category: undefined, difficulty: undefined })}>
          <Badge
            variant={!difficulty && !category ? "default" : "outline"}
            className="cursor-pointer text-sm py-1 px-3 hover:opacity-80 transition-opacity"
          >
            All
          </Badge>
        </a>
        <span className="text-muted-foreground text-xs self-center px-1">
          Difficulty:
        </span>
        {difficulties.map((d) => (
          <a key={d} href={buildUrl({ difficulty: difficulty === d ? undefined : d })}>
            <Badge
              variant={difficulty === d ? "default" : "outline"}
              className="cursor-pointer text-sm py-1 px-3 capitalize hover:opacity-80 transition-opacity"
            >
              {d}
            </Badge>
          </a>
        ))}
        {categories.length > 0 && (
          <span className="text-muted-foreground text-xs self-center px-1">
            Category:
          </span>
        )}
        {categories.map((cat) => (
          <a key={cat} href={buildUrl({ category: category === cat ? undefined : cat })}>
            <Badge
              variant={category === cat ? "default" : "outline"}
              className="cursor-pointer text-sm py-1 px-3 hover:opacity-80 transition-opacity"
            >
              {cat}
            </Badge>
          </a>
        ))}
      </div>

      {/* Active filters */}
      {(q || category || difficulty) && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filters:</span>
          {q && (
            <Badge variant="secondary" className="gap-1">
              Search: "{q}"
              <a href={buildUrl({ q: undefined })} className="ml-1 hover:text-destructive">×</a>
            </Badge>
          )}
          {difficulty && (
            <Badge variant="secondary" className="gap-1 capitalize">
              {difficulty}
              <a href={buildUrl({ difficulty: undefined })} className="ml-1 hover:text-destructive">×</a>
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="gap-1">
              {category}
              <a href={buildUrl({ category: undefined })} className="ml-1 hover:text-destructive">×</a>
            </Badge>
          )}
          <a href="/courses" className="text-muted-foreground hover:text-destructive text-xs underline">
            Clear all
          </a>
        </div>
      )}

      {/* Grid */}
      {coursesWithStats.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {q ? `No results for "${q}".` : "Try a different filter."}
          </p>
          <a href="/courses" className="mt-4 inline-block text-sm text-primary hover:underline">
            Clear filters
          </a>
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