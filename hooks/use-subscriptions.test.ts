import { describe, expect, it } from "vitest"
import { initialState, reducer, type TrackerState } from "./use-subscriptions"
import { createAppData } from "@/lib/storage"
import type { Subscription } from "@/lib/subscriptions"

function sub(id: string, name: string): Subscription {
  return {
    id,
    name,
    cost: 10,
    cycle: "monthly",
    category: "streaming",
    paused: false,
    createdAt: 1,
    updatedAt: 1,
  }
}

function readyState(subs: Subscription[]): TrackerState {
  return { ...initialState, status: "ready", data: createAppData(subs) }
}

const draft = { name: "New", cost: 5, cycle: "monthly" as const, category: "other" }

describe("reducer", () => {
  it("adds a subscription with generated id and timestamps", () => {
    const state = reducer(readyState([]), { type: "add", draft })
    const [added] = state.data.subscriptions
    expect(added.id).toBeTruthy()
    expect(added.createdAt).toBeGreaterThan(0)
    expect(added.paused).toBe(false)
  })

  it("deleting records the deleted item for undo, and only the matching token can restore it", () => {
    let state: TrackerState = readyState([sub("a", "A"), sub("b", "B")])
    state = reducer(state, { type: "delete", id: "a" })
    expect(state.data.subscriptions.map((s) => s.id)).toEqual(["b"])
    expect(state.lastDeleted?.item.id).toBe("a")

    // A second delete moves the undo pointer to "b"…
    state = reducer(state, { type: "delete", id: "b" })
    expect(state.lastDeleted?.item.id).toBe("b")

    // …so a stale toast bound to "a" must NOT restore anything.
    const stale = reducer(state, { type: "undo-delete", targetId: "a" })
    expect(stale.data.subscriptions).toHaveLength(0)

    // The current toast bound to "b" restores it at its original position.
    const restored = reducer(state, { type: "undo-delete", targetId: "b" })
    expect(restored.data.subscriptions.map((s) => s.id)).toEqual(["b"])
  })

  it("restores an undo at the original index", () => {
    let state: TrackerState = readyState([sub("a", "A"), sub("b", "B"), sub("c", "C")])
    state = reducer(state, { type: "delete", id: "b" })
    state = reducer(state, { type: "undo-delete", targetId: "b" })
    expect(state.data.subscriptions.map((s) => s.id)).toEqual(["a", "b", "c"])
  })

  it("clears the undo buffer on the next mutation", () => {
    let state: TrackerState = readyState([sub("a", "A")])
    state = reducer(state, { type: "delete", id: "a" })
    state = reducer(state, { type: "add", draft })
    expect(state.lastDeleted).toBeNull()
    expect(state.data.subscriptions).toHaveLength(1)
  })

  it("toggles pause without touching other fields", () => {
    const state = reducer(readyState([sub("a", "A")]), { type: "toggle-paused", id: "a" })
    expect(state.data.subscriptions[0].paused).toBe(true)
    expect(state.data.subscriptions[0].name).toBe("A")
  })

  it("ignores mutations while loading", () => {
    const state = reducer(initialState, { type: "add", draft })
    expect(state).toBe(initialState)
  })

  it("clear-all keeps settings but empties subscriptions", () => {
    const state = reducer(readyState([sub("a", "A")]), { type: "clear-all" })
    expect(state.data.subscriptions).toHaveLength(0)
    expect(state.data.settings.currency).toBe("USD")
  })
})
