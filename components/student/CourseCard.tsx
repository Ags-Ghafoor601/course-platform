import Link from "next/link"
import { BookOpen, Clock, BarChart3 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration } from "@/lib/utils"
import type { CourseWithStats } from "@/lib/types/database"

const difficultyConfig = {
  beginner: { label: "Beginner", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  intermediate: { label: "Intermediate", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
  advanced: { label: "Advanced", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
}

interface CourseCardProps {
  course: CourseWithStats
  enrolled?: boolean
  progress?: number
}

export default function CourseCard({ course, enrolled, progress }: CourseCardProps) {
  const difficulty = difficultyConfig[course.difficulty]
  const totalMinutes = course.total_minutes ?? 0

  return (
    <Link href={`/courses/${course.id}`}>
      <Card className="h-full hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer group">
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-t-lg overflow-hidden">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {enrolled && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-primary-foreground text-xs">
                Enrolled
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-2 pt-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          <Badge
            variant="secondary"
            className={cn("w-fit text-xs", difficulty.className)}
          >
            {difficulty.label}
          </Badge>
        </CardHeader>

        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3.5 w-3.5" />
              {course.milestone_count || 0} milestones
            </span>
            {totalMinutes > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(totalMinutes)}
              </span>
            )}
          </div>
          {typeof progress === "number" && (
            <span className="text-xs font-medium text-primary">
              {progress}%
            </span>
          )}
        </CardFooter>

        {/* Progress bar */}
        {typeof progress === "number" && (
          <div className="h-1 bg-muted rounded-b-lg overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Card>
    </Link>
  )
}