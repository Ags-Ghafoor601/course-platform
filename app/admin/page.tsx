import { createClient } from "@/lib/supabase/server"
import { BookOpen, Users, TrendingUp, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const metadata = { title: "Admin Overview" }

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: totalCourses },
    { count: publishedCourses },
    { count: totalStudents },
    { count: totalEnrollments },
    { data: recentCourses },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("enrollments").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  const stats = [
    {
      label: "Total Courses",
      value: totalCourses || 0,
      icon: BookOpen,
      sub: `${publishedCourses || 0} published`,
      color: "text-blue-500",
    },
    {
      label: "Students",
      value: totalStudents || 0,
      icon: Users,
      sub: "registered accounts",
      color: "text-green-500",
    },
    {
      label: "Enrollments",
      value: totalEnrollments || 0,
      icon: TrendingUp,
      sub: "total across all courses",
      color: "text-purple-500",
    },
    {
      label: "Published",
      value: publishedCourses || 0,
      icon: Eye,
      sub: `of ${totalCourses || 0} total courses`,
      color: "text-orange-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, here's what's happening.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">+ New Course</Link>
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, sub, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent courses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Courses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses">View all</Link>
          </Button>
        </div>
        <Card>
          <div className="divide-y divide-border">
            {(recentCourses || []).length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No courses yet.{" "}
                <Link href="/admin/courses/new" className="text-primary hover:underline">
                  Create your first course
                </Link>
              </div>
            ) : (
              (recentCourses || []).map((course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {course.category} · {course.difficulty}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}