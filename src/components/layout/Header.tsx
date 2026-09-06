"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { href: "/#playground", label: "Playground" },
  { href: "/#methods", label: "Methods" },
  { href: "/#comparisons", label: "Comparisons" },
  { href: "/#challenges", label: "Challenges" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex min-h-14 min-w-0 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-1 text-sm font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-sm border border-foreground/20 font-mono text-[0.65rem] text-muted-foreground"
          >
            <span className="size-2 rounded-xs bg-primary" />
          </span>
          <span className="truncate">Python Lists Playground</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <nav aria-label="Page sections" className="hidden md:flex md:items-center md:gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="min-h-11 min-w-11 md:hidden"
                  aria-label="Page sections"
                />
              }
            >
              <MenuIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              {NAV_LINKS.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  render={<Link href={link.href} />}
                  nativeButton={false}
                  className="min-h-11 cursor-pointer"
                >
                  {link.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
