"use client"

import * as React from "react"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { AuthProvider } from "@/hooks/use-auth"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
}

/** Mounted once so sonner toasts match the active theme. */
export function AppToaster() {
  return (
    <Toaster
      position="bottom-right"
      closeButton
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-xl !border !border-border !bg-popover !text-popover-foreground !shadow-lg !font-sans",
          title: "!text-[13px] !font-semibold",
          description: "!text-[12px] !text-muted-foreground",
          actionButton: "!rounded-lg !bg-primary !text-primary-foreground",
          cancelButton: "!rounded-lg !bg-secondary !text-secondary-foreground",
          closeButton: "!border-border !bg-card !text-muted-foreground",
        },
      }}
    />
  )
}
