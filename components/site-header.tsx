"use client";

import Link from "next/link";
import * as React from "react";
import { Plus, LogOut, User, Sparkles, Cloud, CloudOff } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTracker } from "@/components/tracker-provider";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export function SiteHeader() {
  const { openAdd, openAuth, isAuthenticated } = useTracker();
  const { user, logout, status } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`sticky top-0 z-40 border-b transition-all duration-500 ${
        scrolled
          ? "border-white/[0.08] bg-[#0e181b]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#0e181b]/70"
          : "border-transparent bg-transparent"
      }`}
      data-print="hide"
    >
      {/* Subtle top glow line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent opacity-60" />

      <div className="mx-auto flex h-[68px] w-full max-w-[1280px] items-center justify-between gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl py-1.5 pr-2 transition-all"
          aria-label="Subscription Tracker — home"
        >
          <div className="relative">
            <div className="absolute -inset-2 rounded-xl bg-emerald-400/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
            <LogoMark className="relative size-[32px] transition-transform duration-300 group-hover:scale-[1.05]" />
          </div>
          <div className="hidden sm:block">
            <span className="block text-[15px] font-semibold tracking-tight leading-none">Subscription Tracker</span>
            <span className="block text-[11px] font-medium tracking-wide text-white/40 leading-none mt-1">OBSIDIAN LEDGER</span>
          </div>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.04] p-1 backdrop-blur-md sm:flex">
            <a
              href="#features"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Features
            </a>
            <a
              href="#faq"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-1.5">
            {status !== "loading" && (
              <>
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-1.5">
                    <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 sm:flex">
                      <Cloud className="size-3.5 text-emerald-300" />
                      <span className="text-[12px] font-medium text-emerald-200/80">Synced</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5">
                      <div className="size-5 rounded-full bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center text-[10px] font-bold text-black">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate text-[12px] font-medium text-white/70">{user.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => logout()}
                      aria-label="Sign out"
                      className="rounded-full border border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white"
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-amber-400/15 bg-amber-400/10 px-3 py-1.5">
                      <CloudOff className="size-3.5 text-amber-300" />
                      <span className="text-[11px] font-medium text-amber-200/70">Local only</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openAuth("login")}
                      className="rounded-full border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white h-9 px-4"
                    >
                      <User className="size-4" />
                      Sign in
                    </Button>
                  </div>
                )}
              </>
            )}

            <ThemeToggle />

            <Button
              size="sm"
              onClick={openAdd}
              className="group relative ml-1 h-9 overflow-hidden rounded-full bg-white px-5 text-[13px] font-semibold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.12)] transition-all hover:bg-white/90 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_rgba(0,0,0,0.16)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="relative flex items-center gap-1.5">
                <Plus className="size-4 transition-transform group-hover:rotate-90 duration-300" />
                <span className="hidden sm:inline">New</span>
                <span className="sm:hidden">Add</span>
              </span>
            </Button>
          </div>
        </nav>
      </div>
    </motion.header>
  );
}
