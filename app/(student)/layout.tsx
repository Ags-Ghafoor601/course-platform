import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import StudentNavbar from "@/components/student/StudentNavbar"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profile?.role === "admin") redirect("/admin")

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar profile={profile} />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}