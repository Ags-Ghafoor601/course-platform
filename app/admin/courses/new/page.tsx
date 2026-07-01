import CourseForm from "@/components/admin/CourseForm"

export const metadata = { title: "New Course" }

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Course</h1>
        <p className="text-muted-foreground mt-1">
          Fill in the details to create a new course.
        </p>
      </div>
      <CourseForm />
    </div>
  )
}