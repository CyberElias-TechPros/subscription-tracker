"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { toast } from "sonner"
import { useSubscriptions } from "@/hooks/use-subscriptions"
import type { Subscription, SubscriptionDraft } from "@/lib/subscriptions"
import type { AppData } from "@/lib/storage"

// Dialogs (and their form/validation libraries) load on first open,
// keeping the initial payload lean.
const SubscriptionDialog = dynamic(
  () => import("@/components/subscription-dialog").then((m) => m.SubscriptionDialog),
  { ssr: false },
)
const SettingsDialog = dynamic(
  () => import("@/components/settings-dialog").then((m) => m.SettingsDialog),
  { ssr: false },
)

interface TrackerContextValue {
  state: ReturnType<typeof useSubscriptions>["state"]
  addSubscription: (draft: SubscriptionDraft) => void
  updateSubscription: (id: string, patch: SubscriptionDraft) => void
  deleteSubscription: (sub: Subscription) => void
  togglePaused: (sub: Subscription) => void
  setCurrency: (currency: string) => void
  replaceAll: (data: AppData) => void
  loadSample: () => void
  clearAll: () => void
  openAdd: () => void
  openEdit: (sub: Subscription) => void
  openSettings: () => void
  /** True while any modal is open — used to gate global shortcuts. */
  anyOverlayOpen: boolean
  currency: string
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null)

export function useTracker(): TrackerContextValue {
  const ctx = React.useContext(TrackerContext)
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider")
  return ctx
}

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const { state, dispatch, saveError } = useSubscriptions()
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Subscription | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  // One-shot announcements (corrupt storage, legacy migration, save failure).
  const fired = React.useRef({ corrupted: false, migrated: false, saveError: false })
  React.useEffect(() => {
    if (state.status !== "ready") return
    if (state.corrupted && !fired.current.corrupted) {
      fired.current.corrupted = true
      toast.error("Stored data couldn't be read", {
        description: "It may have been corrupted. Starting fresh — export a backup once you've re-added your subscriptions.",
      })
    }
    if (state.migrated && !fired.current.migrated) {
      fired.current.migrated = true
      toast.success("Your subscriptions were carried over", {
        description: "Data from the previous version of the tracker was imported automatically.",
      })
    }
    if (saveError && !fired.current.saveError) {
      fired.current.saveError = true
      toast.error("Changes can't be saved in this browser", {
        description:
          "Storage is unavailable (private mode or full quota). Your edits work for this session only — export a backup before closing the tab.",
        duration: 10000,
      })
    }
  }, [state, saveError])

  const value = React.useMemo<TrackerContextValue>(() => {
    const withUndoToast = (sub: Subscription) => {
      dispatch({ type: "delete", id: sub.id })
      toast(`${sub.name} removed`, {
        description: "This row is gone from your totals.",
        action: {
          label: "Undo",
          onClick: () => dispatch({ type: "undo-delete", targetId: sub.id }),
        },
        duration: 6000,
      })
    }
    return {
      state,
      currency: state.data.settings.currency,
      addSubscription: (draft) => {
        dispatch({ type: "add", draft })
        toast.success(`${draft.name} added`, { description: "It's now included in your totals." })
      },
      updateSubscription: (id, patch) => {
        dispatch({ type: "update", id, patch })
        toast.success(`${patch.name} updated`)
      },
      deleteSubscription: withUndoToast,
      togglePaused: (sub) => {
        dispatch({ type: "toggle-paused", id: sub.id })
        toast(sub.paused ? `${sub.name} resumed` : `${sub.name} paused`, {
          description: sub.paused
            ? "It's back in your totals."
            : "It stays in your list but leaves your totals.",
        })
      },
      setCurrency: (currency) => dispatch({ type: "set-currency", currency }),
      replaceAll: (data) => dispatch({ type: "replace-all", data }),
      loadSample: () => {
        dispatch({ type: "load-sample" })
        toast.success("Sample ledger loaded", {
          description: "Explore freely — clear it any time in Settings.",
        })
      },
      clearAll: () => {
        dispatch({ type: "clear-all" })
        toast("All subscriptions cleared")
      },
      openAdd: () => {
        setEditing(null)
        setAddDialogOpen(true)
      },
      openEdit: (sub) => {
        setEditing(sub)
        setAddDialogOpen(true)
      },
      openSettings: () => setSettingsOpen(true),
      anyOverlayOpen: addDialogOpen || settingsOpen,
    }
  }, [state, dispatch, addDialogOpen, settingsOpen])

  return (
    <TrackerContext.Provider value={value}>
      {children}
      <SubscriptionDialog
        key={editing?.id ?? "new"}
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open)
          if (!open) setEditing(null)
        }}
        editing={editing}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </TrackerContext.Provider>
  )
}
