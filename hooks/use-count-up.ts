"use client"

import * as React from "react"

/**
 * Smoothly animates a number from its previous value to the next value.
 * Falls back to an instant jump when the user prefers reduced motion.
 */
export function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = React.useState(target)
  const previous = React.useRef(target)

  React.useEffect(() => {
    const from = previous.current
    const to = target
    previous.current = target

    if (from === to) return
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(to)
      return
    }

    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(from + (to - from) * eased)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return value
}
