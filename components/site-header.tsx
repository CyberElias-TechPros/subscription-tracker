"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { LogoMark } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useTracker } from "@/components/tracker-provider"

export function SiteHeader() {
  const { openAdd } = useTracker()

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md" data-print="hide">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg py-1 text-foreground transition-opacity hover:opacity-80"
          aria-label="Subscription Tracker — home"
        >
          <LogoMark className="size-7" />
          <span className="hidden font-semibold tracking-tight sm:inline">Subscription Tracker</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1">
          <a
            href="#faq"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground sm:block"
          >
            FAQ
          </a>
          <a
            href="https://github.com/CyberElias-TechPros/subscription-tracker"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source code on GitHub"
            className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <ThemeToggle />
          <Button size="sm" onClick={openAdd} className="ml-1">
            <Plus aria-hidden="true" />
            <span className="hidden sm:inline">Add subscription</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </nav>
      </div>
    </header>
  )
}
