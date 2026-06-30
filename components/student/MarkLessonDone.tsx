"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function MarkLessonDone({
  lessonId,
  studentId,
  isCompleted,
  nextLessonId,
  courseId,
}: {
  lessonId: string
  studentId: string
  isCompleted: boolean
  nextLessonId?: string
  courseId: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleMark() {
    if (isCompleted) {
      if (nextLessonId) router.push(`/learn/${courseId}/${nextLessonId}`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from("lesson_progress").insert({
      lesson_id: lessonId,
      student_id: studentId,
    })

    if (error) {
      toast.error("Could not save progress. Try again.")
      setLoading(false)
      return
    }

    toast.success(nextLessonId ? "Lesson complete! Moving to next." : "Lesson complete! Course finished 🎉")
    router.refresh()

    if (nextLessonId) {
      setTimeout(() => router.push(`/learn/${courseId}/${nextLessonId}`), 600)
    }

    setLoading(false)
  }

  return (
    <Button
      onClick={handleMark}
      disabled={loading}
      variant={isCompleted ? "outline" : "default"}
      className={isCompleted ? "border-primary text-primary" : ""}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <CheckCircle2 className="h-4 w-4 mr-2" />
      )}
      {isCompleted
        ? nextLessonId
          ? "Next lesson →"
          : "Completed ✓"
        : "Mark as done"}
    </Button>
  )
}