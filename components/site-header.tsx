"use client";

import Link from "next/link";
import * as React from "react";
import { Plus, LogOut, User, Cloud, CloudOff } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTracker } from "@/components/tracker-provider";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#tracker", label: "Tracker" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const { openAdd, openAuth, isAuthenticated } = useTracker();
  const { user, logout, status } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/85 shadow-xs backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
          : "border-b border-transparent bg-transparent",
      )}
      data-print="hide"
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 sm:px-8">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg py-1.5 pr-2 transition-opacity hover:opacity-85"
          aria-label="Subscription Tracker — home"
        >
          <LogoMark className="size-8 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="hidden text-[15px] font-semibold tracking-tight text-foreground sm:block">
            Subscription&nbsp;Tracker
          </span>
        </Link>

        {/* Center nav */}
        <nav
          aria-label="Primary"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative rounded-lg px-3.5 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
              <span className="absolute inset-x-3.5 -bottom-px h-px scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {status !== "loading" && (
            <>
              {isAuthenticated && user ? (
                <>
                  <div className="hidden items-center gap-1.5 rounded-full border border-accent/20 bg-accent-soft px-2.5 py-1.5 lg:flex">
                    <Cloud className="size-3.5 text-accent" />
                    <span className="text-[11px] font-medium text-accent">Synced</span>
                  </div>
                  <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-xs sm:flex">
                    <div className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <span className="max-w-[120px] truncate text-[12px] font-medium text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    aria-label="Sign out"
                    className="rounded-full"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 shadow-xs lg:flex">
                    <CloudOff className="size-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">Local only</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openAuth("login")} className="rounded-full">
                    <User className="size-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Button>
                </>
              )}
            </>
          )}

          <ThemeToggle />

          <Button
            size="sm"
            onClick={openAdd}
            className="group rounded-full"
          >
            <Plus className="size-4 transition-transform duration-300 group-hover:rotate-90" />
            <span className="hidden sm:inline">New</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
