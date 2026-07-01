"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

export default function PublishToggle({
  courseId,
  isPublished,
}: {
  courseId: string
  isPublished: boolean
}) {
  const [published, setPublished] = useState(isPublished)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    setLoading(true)
    const supabase = createClient()
    const newState = !published

    const { error } = await supabase
      .from("courses")
      .update({ is_published: newState, updated_at: new Date().toISOString() })
      .eq("id", courseId)

    if (error) {
      toast.error("Failed to update status")
      setLoading(false)
      return
    }

    setPublished(newState)
    toast.success(newState ? "Course published" : "Course unpublished")
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="focus:outline-none disabled:opacity-50"
      title={published ? "Click to unpublish" : "Click to publish"}
    >
      <Badge
        variant={published ? "default" : "secondary"}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        {published ? "Published" : "Draft"}
      </Badge>
    </button>
  )
}