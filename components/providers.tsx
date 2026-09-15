"use client"

import * as React from "react"
import { ThemeProvider, useTheme } from "next-themes"
import { Toaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

/** Mounted once so sonner toasts match the active theme. */
export function AppToaster() {
  const { resolvedTheme } = useTheme()
  return (
    <Toaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="bottom-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: "!rounded-[14px] !border !border-white/10 !bg-[#111d1f]/90 !backdrop-blur-xl !text-white !shadow-2xl",
        },
      }}
    />
  )
}
