export default function AdminLoading() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-64 border-r border-border bg-card" />
      <div className="flex-1 p-8">
        <div className="space-y-6 animate-pulse max-w-7xl">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    </div>
  )
}