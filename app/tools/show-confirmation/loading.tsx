import { Skeleton } from "@/components/ui/skeleton"
import { ToolPage } from "@/components/tool-page"

export default function Loading() {
  return (
    <ToolPage
      title="Show Confirmation"
      description="Confirm a show in one form. Sends the producer email, adds the calendar event, and creates the Drive folder."
    >
      <div
        className="flex flex-col items-center gap-10"
        role="status"
        aria-live="polite"
        aria-label="Loading show confirmation"
      >
        <nav aria-label="Progress" className="w-full max-w-sm">
          <ol className="flex items-center justify-between">
            {[0, 1, 2].map((idx) => (
              <li key={idx} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
                {idx < 2 && (
                  <div className="flex-1 mx-3 mb-5">
                    <Skeleton className="h-px w-full rounded-none" />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="w-full rounded-xl border border-border bg-card p-6 space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-72" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-full max-w-sm" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
          </div>

          <Skeleton className="h-10 w-full" />
        </div>

        <span className="sr-only">Loading show confirmation form</span>
      </div>
    </ToolPage>
  )
}
