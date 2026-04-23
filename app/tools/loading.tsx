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
      className="mx-auto max-w-3xl"
      aria-busy="true"
      aria-label="Loading tools"
    >
      <div className="mb-8">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="mt-2.5 h-4 w-80 max-w-full" />
      </div>
      <ul className="divide-y divide-border border-y border-border">
        {Array.from({ length: 4 }).map((_, i) => (
          <ToolRowSkeleton key={i} />
        ))}
      </ul>
    </div>
  )
}
