"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useSubscriptions as useLocalSubscriptions } from "@/hooks/use-subscriptions";
import { useAuth } from "@/hooks/use-auth";
import type { Subscription, SubscriptionDraft } from "@/lib/subscriptions";
import type { AppData } from "@/lib/storage";
import { subscriptionsApi, settingsApi, type ApiSubscription } from "@/lib/api-client";
import { createAppData } from "@/lib/storage";

const SubscriptionDialog = dynamic(
  () => import("@/components/subscription-dialog").then((m) => m.SubscriptionDialog),
  { ssr: false }
);
const SettingsDialog = dynamic(
  () => import("@/components/settings-dialog").then((m) => m.SettingsDialog),
  { ssr: false }
);
const AuthDialog = dynamic(
  () => import("@/components/auth-dialog").then((m) => m.AuthDialog),
  { ssr: false }
);

interface TrackerContextValue {
  state: ReturnType<typeof useLocalSubscriptions>["state"] & {
    isSyncing?: boolean;
    isAuthenticated?: boolean;
  };
  addSubscription: (draft: SubscriptionDraft) => Promise<void>;
  updateSubscription: (id: string, patch: SubscriptionDraft) => Promise<void>;
  deleteSubscription: (sub: Subscription) => Promise<void>;
  togglePaused: (sub: Subscription) => Promise<void>;
  setCurrency: (currency: string) => Promise<void>;
  replaceAll: (data: AppData) => Promise<void>;
  loadSample: () => Promise<void>;
  clearAll: () => Promise<void>;
  openAdd: () => void;
  openEdit: (sub: Subscription) => void;
  openSettings: () => void;
  openAuth: (mode?: "login" | "register") => void;
  anyOverlayOpen: boolean;
  currency: string;
  isAuthenticated: boolean;
  syncLocalToCloud: () => Promise<void>;
}

const TrackerContext = React.createContext<TrackerContextValue | null>(null);

export function useTracker(): TrackerContextValue {
  const ctx = React.useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}

function apiToLocal(api: ApiSubscription): Subscription {
  return {
    id: api.id,
    name: api.name,
    cost: api.cost,
    cycle: api.cycle,
    category: api.category,
    notes: api.notes,
    startDate: api.startDate,
    paused: api.paused,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

function localToApiDraft(draft: SubscriptionDraft | Subscription) {
  return {
    name: draft.name,
    cost: draft.cost,
    cycle: draft.cycle,
    category: draft.category,
    notes: draft.notes,
    startDate: draft.startDate,
    paused: (draft as any).paused ?? false,
  };
}

export function TrackerProvider({ children }: { children: React.ReactNode }) {
  const { state: localState, dispatch, saveError } = useLocalSubscriptions();
  const { isAuthenticated, token, user, status: authStatus } = useAuth();

  const [remoteSubs, setRemoteSubs] = React.useState<Subscription[] | null>(null);
  const [remoteCurrency, setRemoteCurrency] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isFetchingRemote, setIsFetchingRemote] = React.useState(false);

  const [addDialogOpen, setAddDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Subscription | null>(null);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [authDialogOpen, setAuthDialogOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"login" | "register">("login");

  // Fetch remote data when authenticated
  React.useEffect(() => {
    if (!isAuthenticated || !token) {
      setRemoteSubs(null);
      setRemoteCurrency(null);
      return;
    }

    let cancelled = false;
    const fetchRemote = async () => {
      setIsFetchingRemote(true);
      try {
        const [subsRes, settingsRes] = await Promise.all([
          subscriptionsApi.list(token),
          settingsApi.get(token).catch(() => ({ settings: { currency: user?.currency || "USD" } })),
        ]);
        if (cancelled) return;
        setRemoteSubs(subsRes.subscriptions.map(apiToLocal));
        setRemoteCurrency(settingsRes.settings.currency);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch remote data", err);
          toast.error("Couldn't sync with cloud", {
            description: "Working offline. Your local data is safe.",
          });
        }
      } finally {
        if (!cancelled) setIsFetchingRemote(false);
      }
    };

    fetchRemote();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token, user?.currency]);

  // One-shot toasts
  const fired = React.useRef({ corrupted: false, migrated: false, saveError: false });
  React.useEffect(() => {
    if (localState.status !== "ready") return;
    if (localState.corrupted && !fired.current.corrupted) {
      fired.current.corrupted = true;
      toast.error("Stored data couldn't be read", {
        description: "It may have been corrupted. Starting fresh — export a backup once you've re-added your subscriptions.",
      });
    }
    if (localState.migrated && !fired.current.migrated) {
      fired.current.migrated = true;
      toast.success("Your subscriptions were carried over", {
        description: "Data from the previous version was imported automatically.",
      });
    }
    if (saveError && !fired.current.saveError) {
      fired.current.saveError = true;
      toast.error("Changes can't be saved in this browser", {
        description: "Storage is unavailable. Your edits work for this session only — export a backup before closing the tab.",
        duration: 10000,
      });
    }
  }, [localState, saveError]);

  // Determine effective state
  const effectiveState = React.useMemo(() => {
    if (isAuthenticated) {
      if (isFetchingRemote && remoteSubs === null) {
        return { status: "loading" as const, data: { version: 1 as const, subscriptions: [], settings: { currency: remoteCurrency || user?.currency || "USD" } }, lastDeleted: null, corrupted: false, migrated: false, isSyncing: true, isAuthenticated: true };
      }
      return {
        status: "ready" as const,
        data: {
          version: 1 as const,
          subscriptions: remoteSubs || [],
          settings: { currency: remoteCurrency || user?.currency || "USD" },
        },
        lastDeleted: null,
        corrupted: false,
        migrated: false,
        isSyncing,
        isAuthenticated: true,
      };
    }
    // Guest mode - use local
    return {
      ...localState,
      isSyncing: false,
      isAuthenticated: false,
    };
  }, [isAuthenticated, isFetchingRemote, remoteSubs, remoteCurrency, user?.currency, isSyncing, localState]);

  const currency = effectiveState.status === "ready" ? effectiveState.data.settings.currency : "USD";

  // Sync local to cloud
  const syncLocalToCloud = React.useCallback(async () => {
    if (!isAuthenticated || !token || localState.status !== "ready") return;
    const localSubs = localState.data.subscriptions;
    if (localSubs.length === 0) {
      toast.info("No local data to sync");
      return;
    }
    setIsSyncing(true);
    try {
      const result = await subscriptionsApi.import(token, localSubs.map(s => ({
        name: s.name,
        cost: s.cost,
        cycle: s.cycle,
        category: s.category,
        notes: s.notes,
        startDate: s.startDate,
        paused: s.paused,
      })));
      setRemoteSubs(result.subscriptions.map(apiToLocal));
      toast.success(`Synced ${result.imported} subscriptions to cloud`, {
        description: "Your local data is now backed up and available everywhere.",
      });
    } catch (err: any) {
      toast.error("Sync failed", { description: err.message || "Could not sync local data" });
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, token, localState]);

  const value = React.useMemo<TrackerContextValue>(() => {
    const withUndoToast = async (sub: Subscription) => {
      if (isAuthenticated && token) {
        try {
          await subscriptionsApi.delete(token, sub.id);
          setRemoteSubs((prev) => (prev ? prev.filter((s) => s.id !== sub.id) : prev));
          toast(`${sub.name} removed`, {
            description: "This row is gone from your totals.",
            action: {
              label: "Undo",
              onClick: async () => {
                try {
                  const res = await subscriptionsApi.create(token, localToApiDraft(sub));
                  setRemoteSubs((prev) => (prev ? [...prev, apiToLocal(res.subscription)] : [apiToLocal(res.subscription)]));
                  toast.success(`${sub.name} restored`);
                } catch {}
              },
            },
            duration: 6000,
          });
        } catch (err: any) {
          toast.error("Delete failed", { description: err.message });
        }
        return;
      }
      // Local mode
      dispatch({ type: "delete", id: sub.id });
      toast(`${sub.name} removed`, {
        description: "This row is gone from your totals.",
        action: {
          label: "Undo",
          onClick: () => dispatch({ type: "undo-delete", targetId: sub.id }),
        },
        duration: 6000,
      });
    };

    return {
      state: effectiveState as any,
      currency,
      isAuthenticated,
      addSubscription: async (draft) => {
        if (isAuthenticated && token) {
          setIsSyncing(true);
          try {
            const res = await subscriptionsApi.create(token, localToApiDraft(draft));
            setRemoteSubs((prev) => (prev ? [...prev, apiToLocal(res.subscription)] : [apiToLocal(res.subscription)]));
            toast.success(`${draft.name} added`, { description: "It's now synced to your account." });
          } catch (err: any) {
            toast.error("Failed to add", { description: err.message });
            throw err;
          } finally {
            setIsSyncing(false);
          }
          return;
        }
        dispatch({ type: "add", draft });
        toast.success(`${draft.name} added`, { description: "It's now included in your totals." });
      },
      updateSubscription: async (id, patch) => {
        if (isAuthenticated && token) {
          setIsSyncing(true);
          try {
            const res = await subscriptionsApi.update(token, id, localToApiDraft(patch));
            setRemoteSubs((prev) => (prev ? prev.map((s) => (s.id === id ? apiToLocal(res.subscription) : s)) : prev));
            toast.success(`${patch.name} updated`);
          } catch (err: any) {
            toast.error("Update failed", { description: err.message });
            throw err;
          } finally {
            setIsSyncing(false);
          }
          return;
        }
        dispatch({ type: "update", id, patch });
        toast.success(`${patch.name} updated`);
      },
      deleteSubscription: withUndoToast,
      togglePaused: async (sub) => {
        if (isAuthenticated && token) {
          try {
            const res = await subscriptionsApi.toggle(token, sub.id);
            setRemoteSubs((prev) => (prev ? prev.map((s) => (s.id === sub.id ? apiToLocal(res.subscription) : s)) : prev));
            toast(res.subscription.paused ? `${sub.name} paused` : `${sub.name} resumed`, {
              description: res.subscription.paused ? "It stays in your list but leaves your totals." : "It's back in your totals.",
            });
          } catch (err: any) {
            toast.error("Failed to toggle", { description: err.message });
          }
          return;
        }
        dispatch({ type: "toggle-paused", id: sub.id });
        toast(sub.paused ? `${sub.name} resumed` : `${sub.name} paused`, {
          description: sub.paused ? "It's back in your totals." : "It stays in your list but leaves your totals.",
        });
      },
      setCurrency: async (newCurrency) => {
        if (isAuthenticated && token) {
          try {
            await settingsApi.update(token, newCurrency);
            setRemoteCurrency(newCurrency);
          } catch (err: any) {
            toast.error("Failed to update currency", { description: err.message });
            return;
          }
        }
        dispatch({ type: "set-currency", currency: newCurrency });
      },
      replaceAll: async (data) => {
        if (isAuthenticated && token) {
          setIsSyncing(true);
          try {
            await subscriptionsApi.clearAll(token);
            const result = await subscriptionsApi.import(token, data.subscriptions.map(s => ({
              name: s.name,
              cost: s.cost,
              cycle: s.cycle,
              category: s.category,
              notes: s.notes,
              startDate: s.startDate,
              paused: s.paused,
            })));
            setRemoteSubs(result.subscriptions.map(apiToLocal));
            if (data.settings.currency) {
              await settingsApi.update(token, data.settings.currency);
              setRemoteCurrency(data.settings.currency);
            }
            toast.success(`Imported ${result.imported} subscriptions`);
          } catch (err: any) {
            toast.error("Import failed", { description: err.message });
          } finally {
            setIsSyncing(false);
          }
          return;
        }
        dispatch({ type: "replace-all", data });
      },
      loadSample: async () => {
        if (isAuthenticated && token) {
          setIsSyncing(true);
          try {
            const { buildSampleData } = await import("@/lib/sample-data");
            const sample = buildSampleData();
            await subscriptionsApi.clearAll(token);
            const result = await subscriptionsApi.import(token, sample.subscriptions.map(s => ({
              name: s.name,
              cost: s.cost,
              cycle: s.cycle,
              category: s.category,
              notes: s.notes,
              startDate: s.startDate,
              paused: s.paused,
            })));
            setRemoteSubs(result.subscriptions.map(apiToLocal));
            toast.success("Sample ledger loaded", { description: "Explore freely — clear it any time in Settings." });
          } catch (err: any) {
            toast.error("Failed to load sample", { description: err.message });
          } finally {
            setIsSyncing(false);
          }
          return;
        }
        dispatch({ type: "load-sample" });
        toast.success("Sample ledger loaded", { description: "Explore freely — clear it any time in Settings." });
      },
      clearAll: async () => {
        if (isAuthenticated && token) {
          setIsSyncing(true);
          try {
            await subscriptionsApi.clearAll(token);
            setRemoteSubs([]);
            toast("All subscriptions cleared");
          } catch (err: any) {
            toast.error("Clear failed", { description: err.message });
          } finally {
            setIsSyncing(false);
          }
          return;
        }
        dispatch({ type: "clear-all" });
        toast("All subscriptions cleared");
      },
      openAdd: () => {
        setEditing(null);
        setAddDialogOpen(true);
      },
      openEdit: (sub) => {
        setEditing(sub);
        setAddDialogOpen(true);
      },
      openSettings: () => setSettingsOpen(true),
      openAuth: (mode = "login") => {
        setAuthMode(mode);
        setAuthDialogOpen(true);
      },
      anyOverlayOpen: addDialogOpen || settingsOpen || authDialogOpen,
      syncLocalToCloud,
    };
  }, [
    effectiveState,
    currency,
    isAuthenticated,
    token,
    dispatch,
    addDialogOpen,
    settingsOpen,
    authDialogOpen,
    isSyncing,
    syncLocalToCloud,
  ]);

  return (
    <TrackerContext.Provider value={value}>
      {children}
      <SubscriptionDialog
        key={editing?.id ?? "new"}
        open={addDialogOpen}
        onOpenChange={(open) => {
          setAddDialogOpen(open);
          if (!open) setEditing(null);
        }}
        editing={editing}
      />
      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} initialMode={authMode} />
    </TrackerContext.Provider>
  );
}
