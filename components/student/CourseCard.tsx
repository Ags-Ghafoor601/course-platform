import Link from "next/link"
import { BookOpen, Clock, BarChart3, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDuration } from "@/lib/utils"
import type { CourseWithStats } from "@/lib/types/database"

const difficultyConfig = {
  beginner: {
    label: "Beginner",
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800",
  },
  intermediate: {
    label: "Intermediate",
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  },
  advanced: {
    label: "Advanced",
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  },
}

const categoryGradients: Record<string, string> = {
  "Web Development": "from-blue-500/20 via-blue-400/10",
  "Frontend Frameworks": "from-purple-500/20 via-purple-400/10",
  "Backend Development": "from-green-500/20 via-green-400/10",
  Database: "from-orange-500/20 via-orange-400/10",
  DevOps: "from-red-500/20 via-red-400/10",
  "Mobile Development": "from-pink-500/20 via-pink-400/10",
  "Data Science": "from-teal-500/20 via-teal-400/10",
  "Machine Learning": "from-indigo-500/20 via-indigo-400/10",
  Cybersecurity: "from-slate-500/20 via-slate-400/10",
  General: "from-primary/20 via-primary/10",
}

interface CourseCardProps {
  course: CourseWithStats
  enrolled?: boolean
  progress?: number
}

export default function CourseCard({
  course,
  enrolled,
  progress,
}: CourseCardProps) {
  const difficulty = difficultyConfig[course.difficulty]
  const totalMinutes = course.total_minutes ?? 0
  const gradient =
    categoryGradients[course.category] || "from-primary/20 via-primary/10"

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col">
        {/* Thumbnail */}
        <div
          className={`relative h-44 bg-gradient-to-br ${gradient} to-background overflow-hidden`}
        >
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-14 w-14 text-primary/30 transition-transform duration-300 group-hover:scale-110" />
            </div>
          )}
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
          {enrolled && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-primary-foreground text-xs shadow-md">
                Enrolled
              </Badge>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className={cn("text-xs border", difficulty.className)}
            >
              {difficulty.label}
            </Badge>
          </div>
        </div>

        <CardHeader className="pb-2 pt-4 flex-shrink-0">
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2 text-base">
            {course.title}
          </h3>
          {course.instructor_name && (
            <p className="text-xs text-muted-foreground">
              By {course.instructor_name}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-3 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-3 border-t border-border flex-shrink-0">
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
          {typeof progress === "number" ? (
            <span className="text-xs font-semibold text-primary">
              {progress}%
            </span>
          ) : (
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          )}
        </CardFooter>

        {/* Progress bar */}
        {typeof progress === "number" && (
          <div className="h-1 bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Card>
    </Link>
  )
}