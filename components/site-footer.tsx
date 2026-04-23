/**
 * The site footer, rendered on every page via the root layout.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Upright Citizens Brigade</span>
        <span className="hidden sm:inline">Staff access only</span>
      </div>
    </footer>
  )
}
