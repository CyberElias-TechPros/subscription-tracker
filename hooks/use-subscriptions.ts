"use client"

import * as React from "react"
import { createId, readStoredData, saveAppData, type AppData } from "@/lib/storage"
import type { Subscription, SubscriptionDraft } from "@/lib/subscriptions"
import { buildSampleData } from "@/lib/sample-data"

export interface TrackerState {
  status: "loading" | "ready"
  data: AppData
  /** Last deleted item, restorable via undo. Cleared by any mutation. */
  lastDeleted: { item: Subscription; index: number } | null
  /** Set when stored data could not be parsed — surfaced once via toast. */
  corrupted: boolean
  migrated: boolean
}

type Action =
  | { type: "hydrate"; data: AppData; migrated: boolean; corrupted: boolean }
  | { type: "add"; draft: SubscriptionDraft }
  | { type: "update"; id: string; patch: SubscriptionDraft }
  | { type: "delete"; id: string }
  | { type: "undo-delete"; targetId: string }
  | { type: "toggle-paused"; id: string }
  | { type: "set-currency"; currency: string }
  | { type: "replace-all"; data: AppData }
  | { type: "load-sample" }
  | { type: "clear-all" }

/** Exported for unit tests. */
export function reducer(state: TrackerState, action: Action): TrackerState {
  if (action.type === "hydrate") {
    return {
      status: "ready",
      data: action.data,
      lastDeleted: null,
      corrupted: action.corrupted,
      migrated: action.migrated,
    }
  }
  if (state.status === "loading") return state

  const now = Date.now()
  const { subscriptions, settings } = state.data

  switch (action.type) {
    case "add": {
      const item: Subscription = {
        ...action.draft,
        paused: action.draft.paused ?? false,
        id: createId(),
        createdAt: now,
        updatedAt: now,
      }
      return { ...state, data: { ...state.data, subscriptions: [...subscriptions, item] }, lastDeleted: null }
    }
    case "update": {
      const next = subscriptions.map((sub) =>
        sub.id === action.id
          ? { ...sub, ...action.patch, notes: action.patch.notes || undefined, startDate: action.patch.startDate || undefined, updatedAt: now }
          : sub,
      )
      return { ...state, data: { ...state.data, subscriptions: next }, lastDeleted: null }
    }
    case "delete": {
      const index = subscriptions.findIndex((s) => s.id === action.id)
      if (index === -1) return state
      const item = subscriptions[index]
      return {
        ...state,
        data: { ...state.data, subscriptions: subscriptions.filter((s) => s.id !== action.id) },
        lastDeleted: { item, index },
      }
    }
    case "undo-delete": {
      // Token-bound: only the toast issued for THIS deletion may undo it,
      // so a stale toast can never restore the wrong row.
      if (!state.lastDeleted || state.lastDeleted.item.id !== action.targetId) return state
      const { item, index } = state.lastDeleted
      const next = [...subscriptions]
      next.splice(Math.min(index, next.length), 0, item)
      return { ...state, data: { ...state.data, subscriptions: next }, lastDeleted: null }
    }
    case "toggle-paused": {
      const next = subscriptions.map((sub) =>
        sub.id === action.id ? { ...sub, paused: !sub.paused, updatedAt: now } : sub,
      )
      return { ...state, data: { ...state.data, subscriptions: next } }
    }
    case "set-currency":
      return { ...state, data: { ...state.data, settings: { ...settings, currency: action.currency } } }
    case "replace-all":
      return { ...state, data: action.data, lastDeleted: null }
    case "load-sample":
      return { ...state, data: buildSampleData(), lastDeleted: null }
    case "clear-all":
      return { ...state, data: { version: 1, subscriptions: [], settings }, lastDeleted: null }
    default:
      return state
  }
}

/** Exported for unit tests. */
export const initialState: TrackerState = {
  status: "loading",
  data: { version: 1, subscriptions: [], settings: { currency: "USD" } },
  lastDeleted: null,
  corrupted: false,
  migrated: false,
}

export function useSubscriptions() {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const [saveError, setSaveError] = React.useState(false)

  // Hydrate from localStorage once, after mount (SSR-safe).
  React.useEffect(() => {
    const result = readStoredData()
    if (result.status === "ok") {
      dispatch({ type: "hydrate", data: result.data, migrated: result.migrated, corrupted: false })
    } else if (result.status === "corrupt") {
      dispatch({ type: "hydrate", data: initialState.data, migrated: false, corrupted: true })
    } else {
      dispatch({ type: "hydrate", data: initialState.data, migrated: false, corrupted: false })
    }
  }, [])

  // Persist on every change once ready. Storage can fail (private mode,
  // quota) — surface that instead of failing silently.
  React.useEffect(() => {
    if (state.status !== "ready") return
    const ok = saveAppData(state.data)
    if (!ok && !saveError) setSaveError(true)
    else if (ok && saveError) setSaveError(false)
  }, [state.status, state.data, saveError])

  return { state, dispatch, saveError }
}
