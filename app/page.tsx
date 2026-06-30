import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-foreground">LearnPath</h1>
      <p className="text-muted-foreground text-lg">
        Milestone-based learning platform
      </p>
      {user ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Signed in as {user.email}
          </p>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Go to dashboard
            </Link>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-border px-6 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
          >
            Sign up
          </Link>
        </div>
      )}
    </main>
  )
}