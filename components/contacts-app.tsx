"use client"

import { useState, useMemo } from "react"
import { AlertTriangle, Mail, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ToolPage } from "@/components/tool-page"
import { CONTACT_GROUPS, getMissingEmailPerformers, type Performer } from "@/lib/contacts"

function normalizeQuery(s: string): string {
  return s.toLowerCase().trim()
}

function matchesQuery(performer: Performer, query: string): boolean {
  if (!query) return true
  const q = normalizeQuery(query)
  return (
    performer.name.toLowerCase().includes(q) ||
    (performer.email?.toLowerCase().includes(q) ?? false)
  )
}

function PerformerRow({ performer }: { performer: Performer }) {
  return (
    <div className="flex items-center justify-between py-2 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {performer.email === null && (
          <AlertTriangle
            className="h-3.5 w-3.5 text-amber-500 shrink-0"
            aria-label="Missing email"
          />
        )}
        <span className="text-sm text-foreground truncate">{performer.name}</span>
      </div>
      {performer.email !== null ? (
        <a
          href={`mailto:${performer.email}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 shrink-0"
        >
          <Mail className="h-3 w-3" />
          {performer.email}
        </a>
      ) : (
        <span className="text-xs text-amber-500 shrink-0">No email</span>
      )}
    </div>
  )
}

export function ContactsApp() {
  const [query, setQuery] = useState("")
  const missingCount = getMissingEmailPerformers().length

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return CONTACT_GROUPS
    return CONTACT_GROUPS.map((group) => ({
      ...group,
      performers: group.performers.filter((p) => matchesQuery(p, query)),
    })).filter((group) => group.performers.length > 0)
  }, [query])

  const totalShown = filteredGroups.reduce((sum, g) => sum + g.performers.length, 0)
  const totalAll = CONTACT_GROUPS.reduce((sum, g) => sum + g.performers.length, 0)

  return (
    <ToolPage
      title="ASSSSCAT Contacts"
      description="Full performer roster organized by group. Performers without email addresses are flagged."
      size="lg"
    >
      <div className="space-y-6">
        {missingCount > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              {missingCount} performer{missingCount === 1 ? "" : "s"} missing email address
              {missingCount === 1 ? "" : "es"}.
            </span>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {query && (
          <p className="text-xs text-muted-foreground">
            {totalShown} of {totalAll} performers
          </p>
        )}

        {filteredGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No performers match &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="space-y-8">
            {filteredGroups.map((group) => (
              <section key={group.id}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-medium text-foreground">{group.label}</h2>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {group.performers.length}
                  </Badge>
                </div>
                <div className="divide-y divide-border border-y border-border">
                  {group.performers.map((performer) => (
                    <PerformerRow key={performer.name} performer={performer} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </ToolPage>
  )
}
