import { ThemeToggle } from "@/components/layout/ThemeToggle";

const NAV_LINKS = [
  { href: "#playground", label: "Playground" },
  { href: "#methods", label: "Methods" },
  { href: "#challenges", label: "Challenges" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <a
          href="#main"
          className="flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-6 items-center justify-center rounded-sm border border-foreground/20 font-mono text-[0.65rem] text-muted-foreground"
          >
            <span className="size-2 rounded-[2px] bg-primary" />
          </span>
          <span className="max-w-[10rem] truncate sm:max-w-none">
            Python Lists Playground
          </span>
        </a>

        <div className="flex items-center gap-1">
          <nav
            aria-label="Page sections"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 shrink-0 items-center rounded-lg px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:px-3"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
