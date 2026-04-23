'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ToolPage } from '@/components/tool-page'

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ToolPage
      title="Something went wrong"
      description="We hit an unexpected error loading this tool. You can try again, or head back to the tools list."
    >
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild>
          <a href="/tools">Back to tools</a>
        </Button>
      </div>
    </ToolPage>
  )
}
