"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function EnrollButton({
  courseId,
  studentId,
}: {
  courseId: string
  studentId: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleEnroll() {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("enrollments").insert({
      course_id: courseId,
      student_id: studentId,
    })

    if (error) {
      toast.error("Failed to enroll. Please try again.")
      setLoading(false)
      return
    }

    toast.success("Enrolled successfully! Let's start learning.")
    router.refresh()
    setLoading(false)
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} size="lg">
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? "Enrolling..." : "Enroll now"}
    </Button>
  )
}