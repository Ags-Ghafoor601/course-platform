"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import type { Lesson } from "@/lib/types/database"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

const lessonSchema = z.object({
  title: z.string().min(2, "Title is required"),
  duration_minutes: z.coerce.number().min(0).max(600),
  video_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type LessonFormData = z.infer<typeof lessonSchema>

export default function LessonEditorModal({
  milestoneId,
  lesson,
  lessonCount,
  onSave,
  onClose,
}: {
  milestoneId: string
  lesson?: Lesson
  lessonCount: number
  onSave: (lesson: Lesson, isNew: boolean) => void
  onClose: () => void
}) {
  const [content, setContent] = useState(lesson?.content || "")
  const [loading, setLoading] = useState(false)
  const isEditing = !!lesson

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || "",
      duration_minutes: lesson?.duration_minutes || 10,
      video_url: lesson?.video_url || "",
    },
  })

  async function onSubmit(data: LessonFormData) {
    setLoading(true)
    const supabase = createClient()

    if (isEditing) {
      const { data: updated, error } = await supabase
        .from("lessons")
        .update({
          title: data.title,
          content,
          duration_minutes: data.duration_minutes,
          video_url: data.video_url || null,
        })
        .eq("id", lesson.id)
        .select()
        .single()

      if (error) {
        toast.error("Failed to update lesson")
        setLoading(false)
        return
      }

      toast.success("Lesson updated")
      onSave(updated, false)
    } else {
      const { data: created, error } = await supabase
        .from("lessons")
        .insert({
          milestone_id: milestoneId,
          title: data.title,
          content,
          duration_minutes: data.duration_minutes,
          video_url: data.video_url || null,
          order_index: lessonCount,
        })
        .select()
        .single()

      if (error) {
        toast.error("Failed to create lesson")
        setLoading(false)
        return
      }

      toast.success("Lesson created")
      onSave(created, true)
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Lesson" : "New Lesson"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form
            id="lesson-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="lesson-title">Lesson title</Label>
                <Input
                  id="lesson-title"
                  placeholder="e.g. Introduction to HTML"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={0}
                  max={600}
                  {...register("duration_minutes")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">
                Video URL{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="video_url"
                placeholder="https://youtube.com/embed/..."
                {...register("video_url")}
              />
              {errors.video_url && (
                <p className="text-sm text-destructive">{errors.video_url.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <div data-color-mode="auto">
                <MDEditor
                  value={content}
                  onChange={(v) => setContent(v || "")}
                  height={320}
                  preview="edit"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Supports Markdown — headings, code blocks, lists, bold, etc.
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button form="lesson-form" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading
              ? "Saving..."
              : isEditing
              ? "Save changes"
              : "Create lesson"}
          </Button>
        </div>
      </div>
    </div>
  )
}