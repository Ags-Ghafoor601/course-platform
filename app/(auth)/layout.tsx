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
      <div className="hidden lg:flex flex-col justify-between p-12 bg-primary text-primary-foreground">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <GraduationCap className="h-6 w-6" />
          LearnPath
        </Link>
        <div className="space-y-4">
          <blockquote className="text-2xl font-medium leading-relaxed">
            "The beautiful thing about learning is that nobody can take it away from you."
          </blockquote>
          <p className="text-primary-foreground/70">— B.B. King</p>
        </div>
        <div className="space-y-1 text-sm text-primary-foreground/70">
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