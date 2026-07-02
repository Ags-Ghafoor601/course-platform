"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, CheckCircle2, ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Milestone, Lesson } from "@/lib/types/database"

type MilestoneWithLessons = Milestone & { lessons: Lesson[] }

interface LessonSidebarProps {
  courseId: string
  courseTitle: string
  milestones: MilestoneWithLessons[]
  currentLessonId: string
  completedIds: string[]
  completedCount: number
  totalLessons: number
  progressPercent: number
}

export default function LessonSidebar({
  courseId,
  courseTitle,
  milestones,
  currentLessonId,
  completedIds,
  completedCount,
  totalLessons,
  progressPercent,
}: LessonSidebarProps) {
  const [open, setOpen] = useState(false)
  const completedSet = new Set(completedIds)

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setOpen(true)}
          size="sm"
          className="rounded-full shadow-lg h-12 px-4 gap-2"
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-xs font-medium">
            {completedCount}/{totalLessons}
          </span>
        </Button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-80 bg-background border-l border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <Link
              href={`/courses/${courseId}`}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              onClick={() => setOpen(false)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {courseTitle}
            </Link>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {completedCount}/{totalLessons} completed
              </span>
              <span className="text-xs font-medium text-primary">
                {progressPercent}%
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="ml-3 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Lessons list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {milestones.map((milestone, mIdx) => {
            const lessons = [...(milestone.lessons || [])].sort(
              (a, b) => a.order_index - b.order_index
            )
            return (
              <div key={milestone.id}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1">
                  {mIdx + 1}. {milestone.title}
                </p>
                {lessons.map((l) => {
                  const done = completedSet.has(l.id)
                  const active = l.id === currentLessonId
                  return (
                    <Link
                      key={l.id}
                      href={`/learn/${courseId}/${l.id}`}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      {done && !active ? (
                        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      ) : (
                        <span className="h-3.5 w-3.5 flex-shrink-0" />
                      )}
                      <span className="line-clamp-2 text-xs">{l.title}</span>
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}