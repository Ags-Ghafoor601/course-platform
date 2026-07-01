"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Plus, Trash2, ChevronDown, ChevronRight,
  GripVertical, Loader2, Pencil, Check, X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LessonEditorModal from "@/components/admin/LessonEditorModal"
import type { Milestone, Lesson } from "@/lib/types/database"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type MilestoneWithLessons = Milestone & { lessons: Lesson[] }

export default function MilestoneEditor({
  courseId,
  initialMilestones,
}: {
  courseId: string
  initialMilestones: MilestoneWithLessons[]
}) {
  const [milestones, setMilestones] = useState<MilestoneWithLessons[]>(initialMilestones)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(initialMilestones.map((m) => m.id))
  )
  const [addingMilestone, setAddingMilestone] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("")
  const [newMilestoneDesc, setNewMilestoneDesc] = useState("")
  const [savingMilestone, setSavingMilestone] = useState(false)
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [lessonModal, setLessonModal] = useState<{
    milestoneId: string
    lesson?: Lesson
  } | null>(null)
  const router = useRouter()

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function addMilestone() {
    if (!newMilestoneTitle.trim()) return
    setSavingMilestone(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("milestones")
      .insert({
        course_id: courseId,
        title: newMilestoneTitle.trim(),
        description: newMilestoneDesc.trim() || null,
        order_index: milestones.length,
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to add milestone")
      setSavingMilestone(false)
      return
    }

    const newMilestone = { ...data, lessons: [] }
    setMilestones((prev) => [...prev, newMilestone])
    setExpandedIds((prev) => new Set([...prev, data.id]))
    setNewMilestoneTitle("")
    setNewMilestoneDesc("")
    setAddingMilestone(false)
    setSavingMilestone(false)
    toast.success("Milestone added")
    router.refresh()
  }

  async function deleteMilestone(milestoneId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId)

    if (error) {
      toast.error("Failed to delete milestone")
      return
    }

    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId))
    toast.success("Milestone deleted")
    router.refresh()
  }

  async function saveMilestoneEdit(milestoneId: string) {
    if (!editTitle.trim()) return
    const supabase = createClient()

    const { error } = await supabase
      .from("milestones")
      .update({ title: editTitle.trim(), description: editDesc.trim() || null })
      .eq("id", milestoneId)

    if (error) {
      toast.error("Failed to update milestone")
      return
    }

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, title: editTitle.trim(), description: editDesc.trim() || null }
          : m
      )
    )
    setEditingMilestoneId(null)
    toast.success("Milestone updated")
    router.refresh()
  }

  async function deleteLesson(milestoneId: string, lessonId: string) {
    const supabase = createClient()
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId)

    if (error) {
      toast.error("Failed to delete lesson")
      return
    }

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      )
    )
    toast.success("Lesson deleted")
    router.refresh()
  }

  function handleLessonSaved(milestoneId: string, lesson: Lesson, isNew: boolean) {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m
        if (isNew) return { ...m, lessons: [...m.lessons, lesson] }
        return { ...m, lessons: m.lessons.map((l) => (l.id === lesson.id ? lesson : l)) }
      })
    )
    setLessonModal(null)
    router.refresh()
  }

  return (
    <div className="space-y-3">
      {milestones.length === 0 && !addingMilestone && (
        <Card className="p-8 text-center border-dashed">
          <p className="text-muted-foreground text-sm mb-3">
            No milestones yet. Add your first milestone to structure the course.
          </p>
        </Card>
      )}

      {/* Milestone list */}
      {milestones.map((milestone, mIdx) => {
        const isExpanded = expandedIds.has(milestone.id)
        const isEditing = editingMilestoneId === milestone.id

        return (
          <Card key={milestone.id} className="overflow-hidden">
            {/* Milestone header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-border">
              <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <button
                onClick={() => toggleExpand(milestone.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isEditing ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => saveMilestoneEdit(milestone.id)}
                  >
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    onClick={() => setEditingMilestoneId(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <span className="text-xs font-bold text-muted-foreground w-5">
                    {mIdx + 1}
                  </span>
                  <span className="font-medium text-sm truncate">{milestone.title}</span>
                  <Badge variant="secondary" className="text-xs ml-1">
                    {milestone.lessons.length} lessons
                  </Badge>
                </div>
              )}

              {!isEditing && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => {
                      setEditingMilestoneId(milestone.id)
                      setEditTitle(milestone.title)
                      setEditDesc(milestone.description || "")
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete milestone?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete{" "}
                          <span className="font-medium text-foreground">
                            "{milestone.title}"
                          </span>{" "}
                          and all its lessons. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMilestone(milestone.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {/* Lessons */}
            {isExpanded && (
              <div>
                {milestone.lessons.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground italic">
                    No lessons yet.
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {milestone.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/30 group"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs text-muted-foreground w-5">
                          {lIdx + 1}
                        </span>
                        <span className="text-sm flex-1 truncate">{lesson.title}</span>
                        {lesson.duration_minutes > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {lesson.duration_minutes}m
                          </span>
                        )}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              setLessonModal({ milestoneId: milestone.id, lesson })
                            }
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete lesson?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete{" "}
                                  <span className="font-medium text-foreground">
                                    "{lesson.title}"
                                  </span>{" "}
                                  and all student progress on it.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteLesson(milestone.id, lesson.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add lesson button */}
                <div className="px-4 py-2 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setLessonModal({ milestoneId: milestone.id })}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add lesson
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )
      })}

      {/* Add milestone form */}
      {addingMilestone ? (
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium">New Milestone</p>
          <Input
            placeholder="Milestone title"
            value={newMilestoneTitle}
            onChange={(e) => setNewMilestoneTitle(e.target.value)}
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && addMilestone()}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newMilestoneDesc}
            onChange={(e) => setNewMilestoneDesc(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={addMilestone} disabled={savingMilestone}>
              {savingMilestone && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Add milestone
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setAddingMilestone(false)
                setNewMilestoneTitle("")
                setNewMilestoneDesc("")
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setAddingMilestone(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add milestone
        </Button>
      )}

      {/* Lesson editor modal */}
      {lessonModal && (
        <LessonEditorModal
          milestoneId={lessonModal.milestoneId}
          lesson={lessonModal.lesson}
          lessonCount={
            milestones.find((m) => m.id === lessonModal.milestoneId)?.lessons.length || 0
          }
          onSave={(lesson, isNew) =>
            handleLessonSaved(lessonModal.milestoneId, lesson, isNew)
          }
          onClose={() => setLessonModal(null)}
        />
      )}
    </div>
  )
}