/**
 * The site footer, rendered on every page via the root layout.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 py-4 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-muted-foreground font-medium tabular-nums">
        <span>
          <span className="text-foreground/90">&copy; {year}</span>
          <span className="text-muted-foreground/90">&nbsp;&nbsp;Upright&nbsp;Citizens&nbsp;Brigade</span>
        </span>
        <a
          href="https://ucbcomedy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-muted-foreground hover:text-foreground underline-offset-4 decoration-border/60 hover:decoration-foreground/40 transition-[color,text-decoration-color] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ucbcomedy.com <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  )
}
