"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Course } from "@/lib/types/database"

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  instructor_name: z.string().min(2, "Instructor name is required"),
  thumbnail_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
})

type CourseFormData = z.infer<typeof courseSchema>

const CATEGORIES = [
  "Web Development",
  "Frontend Frameworks",
  "Backend Development",
  "Database",
  "DevOps",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cybersecurity",
  "General",
]

export default function CourseForm({ course }: { course?: Course }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEditing = !!course

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      category: course?.category || "",
      difficulty: course?.difficulty || "beginner",
      instructor_name: course?.instructor_name || "",
      thumbnail_url: course?.thumbnail_url || "",
    },
  })

  const difficulty = watch("difficulty")
  const category = watch("category")

  async function onSubmit(data: CourseFormData) {
    setLoading(true)
    const supabase = createClient()

    if (isEditing) {
      const { error } = await supabase
        .from("courses")
        .update({
          ...data,
          thumbnail_url: data.thumbnail_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id)

      if (error) {
        toast.error("Failed to update course")
        setLoading(false)
        return
      }

      toast.success("Course updated")
      router.push("/admin/courses")
      router.refresh()
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: newCourse, error } = await supabase
        .from("courses")
        .insert({
          ...data,
          thumbnail_url: data.thumbnail_url || null,
          is_published: false,
          created_by: user!.id,
        })
        .select()
        .single()

      if (error) {
        toast.error("Failed to create course")
        setLoading(false)
        return
      }

      toast.success("Course created! Now add milestones.")
      router.push(`/admin/courses/${newCourse.id}`)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">Course title</Label>
            <Input
              id="title"
              placeholder="e.g. Web Development Fundamentals"
              disabled={loading}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What will students learn in this course?"
              rows={4}
              disabled={loading}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setValue("category", v)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) =>
                  setValue("difficulty", v as "beginner" | "intermediate" | "advanced")
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructor_name">Instructor name</Label>
            <Input
              id="instructor_name"
              placeholder="e.g. Abdul Ghafoor"
              disabled={loading}
              {...register("instructor_name")}
            />
            {errors.instructor_name && (
              <p className="text-sm text-destructive">{errors.instructor_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">
              Thumbnail URL{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="thumbnail_url"
              placeholder="https://images.unsplash.com/..."
              disabled={loading}
              {...register("thumbnail_url")}
            />
            {errors.thumbnail_url && (
              <p className="text-sm text-destructive">{errors.thumbnail_url.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                ? "Save changes"
                : "Create course"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}