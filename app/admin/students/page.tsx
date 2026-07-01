import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { getInitials } from "@/lib/utils"

export const metadata = { title: "Students" }

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })

  const studentsWithEnrollments = await Promise.all(
    (students || []).map(async (student) => {
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("student_id", student.id)

      return { ...student, enrollmentCount: count || 0 }
    })
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground mt-1">
          {studentsWithEnrollments.length} registered student
          {studentsWithEnrollments.length !== 1 ? "s" : ""}
        </p>
      </div>

      {studentsWithEnrollments.length === 0 ? (
        <Card className="p-16 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No students yet</h3>
          <p className="text-muted-foreground">
            Students will appear here once they sign up.
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-border">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="col-span-6">Student</span>
              <span className="col-span-3 text-center">Enrollments</span>
              <span className="col-span-3 text-right">Joined</span>
            </div>
            {studentsWithEnrollments.map((student) => (
              <div
                key={student.id}
                className="grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-accent/30 transition-colors"
              >
                <div className="col-span-6 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {student.full_name
                        ? getInitials(student.full_name)
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {student.full_name || "Unknown"}
                    </p>
                  </div>
                </div>
                <div className="col-span-3 text-center">
                  <Badge variant="secondary">{student.enrollmentCount}</Badge>
                </div>
                <div className="col-span-3 text-right text-xs text-muted-foreground">
                  {new Date(student.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}