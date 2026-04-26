/**
 * The site footer, rendered on every page via the root layout.
 */
export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t-2 border-foreground">
      <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] sm:text-xs tracking-[0.25em] uppercase text-foreground/70 font-medium">
        <span>
          &copy; {year}&nbsp;&nbsp;Upright&nbsp;Citizens&nbsp;Brigade
        </span>
        <a
          href="https://ucbcomedy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          ucbcomedy.com <span aria-hidden="true">↗</span>
        </a>
      </div>
    </footer>
  )
}
