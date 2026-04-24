"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const THEMES = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "gay", label: "Gay", Icon: Sparkles },
] as const

type ThemeValue = (typeof THEMES)[number]["value"]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const current: ThemeValue = mounted && THEMES.some((t) => t.value === theme)
    ? (theme as ThemeValue)
    : "dark"

  const ActiveIcon = THEMES.find((t) => t.value === current)?.Icon ?? Moon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Change theme"
          className="h-8 w-8 rounded-md border border-transparent text-foreground/70 hover:text-foreground hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {current === "gay" ? (
            <span
              aria-hidden="true"
              className="inline-block h-4 w-4 rounded-full"
              style={{
                background:
                  "conic-gradient(from 210deg, oklch(0.65 0.24 25), oklch(0.78 0.18 65), oklch(0.85 0.18 95), oklch(0.65 0.22 145), oklch(0.60 0.18 240), oklch(0.55 0.24 305), oklch(0.65 0.24 25))",
              }}
            />
          ) : (
            <ActiveIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">Change theme (current: {current})</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {THEMES.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            aria-current={current === value ? "true" : undefined}
            className="gap-2 text-xs tracking-[0.2em] uppercase font-medium"
          >
            {value === "gay" ? (
              <span
                aria-hidden="true"
                className="inline-block h-3.5 w-3.5 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 210deg, oklch(0.65 0.24 25), oklch(0.78 0.18 65), oklch(0.85 0.18 95), oklch(0.65 0.22 145), oklch(0.60 0.18 240), oklch(0.55 0.24 305), oklch(0.65 0.24 25))",
                }}
              />
            ) : (
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{label}</span>
            {current === value && (
              <span className="ml-auto text-[10px] text-foreground/60">●</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
