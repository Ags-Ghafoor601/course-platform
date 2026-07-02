import Link from "next/link"
import { GraduationCap } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/40 border-r border-border">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg text-foreground"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          LearnPath
        </Link>
        <div className="space-y-4">
          <div className="w-10 h-1 bg-primary rounded-full" />
          <blockquote className="text-2xl font-medium leading-relaxed text-foreground">
            "The beautiful thing about learning is that nobody can take it away from you."
          </blockquote>
          <p className="text-muted-foreground font-medium">— B.B. King</p>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Structured learning through clear milestones.</p>
          <p>Track progress. Stay motivated. Achieve goals.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col justify-center items-center p-8">
        {/* Mobile logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg mb-8 lg:hidden mt-8"
        >
          <GraduationCap className="h-6 w-6 text-primary" />
          LearnPath
        </Link>
        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  )
}