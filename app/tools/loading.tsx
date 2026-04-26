import { Skeleton } from "@/components/ui/skeleton"

function ToolRowSkeleton() {
  return (
    <li>
      <div className="flex items-start gap-4 py-4 px-1">
        <Skeleton className="h-5 w-5 shrink-0 mt-0.5 rounded" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3.5 w-full max-w-md" />
        </div>
      </div>
    </li>
  )
}

export default function ToolsLoading() {
  return (
    <div
      className="mx-auto w-full max-w-3xl page-fade-in"
      aria-busy="true"
      aria-label="Loading tools"
    >
      <div className="mb-9 sm:mb-10 pl-1">
        <Skeleton className="h-9 w-28 rounded" />
        <Skeleton className="mt-2.5 h-4 w-80 max-w-full" />
      </div>
      <ul className="surface-panel divide-y divide-border/90 overflow-hidden px-1.5 sm:px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ToolRowSkeleton key={i} />
        ))}
      </ul>
    </div>
  )
}
