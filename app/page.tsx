import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  GraduationCap,
  BookOpen,
  Trophy,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Users,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: BookOpen,
    title: "Structured Milestones",
    description:
      "Every course is broken into clear, achievable milestones so you always know what to focus on next.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Tracking",
    description:
      "Visual progress indicators across every course, milestone, and lesson. See exactly how far you've come.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description:
      "Complete milestones to unlock the next. A satisfying learning loop that keeps you motivated.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Zap,
    title: "Learn at Your Pace",
    description:
      "Mark lessons complete when you're ready. Resume exactly where you left off, every time.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description:
      "Courses crafted by practitioners with real-world experience, structured for maximum clarity.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: CheckCircle2,
    title: "Rich Content",
    description:
      "Markdown-powered lessons with code blocks, video embeds, and structured explanations.",
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
]

const testimonials = [
  {
    name: "Sarah K.",
    role: "Frontend Developer",
    text: "The milestone structure kept me on track. I finished my first React course in two weeks.",
    rating: 5,
  },
  {
    name: "Ahmad R.",
    role: "CS Student",
    text: "Finally a platform that shows me exactly what I need to do next. No guesswork.",
    rating: 5,
  },
  {
    name: "Priya M.",
    role: "Career Switcher",
    text: "The progress tracking is incredibly motivating. Watching that bar fill up is addictive.",
    rating: 5,
  },
]

const steps = [
  { step: "01", title: "Create account", desc: "Sign up free in under 30 seconds." },
  { step: "02", title: "Browse courses", desc: "Explore courses across multiple categories." },
  { step: "03", title: "Enroll & learn", desc: "Work through milestones at your own pace." },
  { step: "04", title: "Track progress", desc: "Watch your skills grow lesson by lesson." },
]

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <GraduationCap className="h-7 w-7 text-primary" />
              <span>LearnPath</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
            </nav>
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={profile?.role === "admin" ? "/admin" : "/dashboard"}>
                      Dashboard
                    </Link>
                  </Button>
                  <form action="/api/auth/signout" method="POST">
                    <Button variant="outline" size="sm" type="submit">
                      Sign out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Sign in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">Get started free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">
            🎓 Milestone-based learning platform
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight mb-6">
            Learn with clarity.
            <br />
            <span className="text-primary">Progress with purpose.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            LearnPath structures every course into clear milestones, so you always
            know what to learn next, how far you've come, and what you're working
            toward.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto text-base px-8" asChild>
              <Link href="/signup">
                Start learning free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto text-base px-8"
              asChild
            >
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Free to get started
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "10+", label: "Courses" },
              { value: "500+", label: "Students" },
              { value: "98%", label: "Satisfaction" },
              { value: "24/7", label: "Access" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-foreground">{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to learn effectively
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built around the science of structured learning, LearnPath gives you
              the tools to stay focused and motivated.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color, bg }) => (
              <Card
                key={title}
                className="border-border hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="pt-6 space-y-3">
                  <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">How it works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Up and learning in minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps from signup to your first completed lesson.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg">
                    {step}
                  </div>
                  <h3 className="font-semibold text-base">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by learners
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <Card key={name} className="border-border">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    "{text}"
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-muted-foreground">{role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start your learning journey?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of learners who are building real skills through
            structured, milestone-based courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="text-base px-8"
              asChild
            >
              <Link href="/signup">
                Create free account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8 bg-transparent border-white/60 text-white hover:bg-white/15 hover:border-white"
              asChild
            >
              <Link href="/courses">Browse courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="h-5 w-5 text-primary" />
              LearnPath
            </Link>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
              <Link href="/courses" className="hover:text-foreground transition-colors">Courses</Link>
              <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} LearnPath. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}