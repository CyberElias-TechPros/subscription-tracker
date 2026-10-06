"use client";

import * as React from "react";

/**
 * Desktop-only ambient light: a soft accent-tinted glow that trails the
 * cursor, like light on paper. Subtle enough for the light theme, deeper
 * in the dark theme. Disabled for touch and reduced-motion users.
 */
export function CursorGlow() {
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [visible, setVisible] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
        if (!visible) setVisible(true);
      });
    };

    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.4s ease" }}
    >
      <div
        className="absolute size-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[90px] transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] dark:blur-[110px]"
        style={{
          left: pos.x,
          top: pos.y,
          background:
            "radial-gradient(circle at center, color-mix(in oklab, var(--accent) 9%, transparent) 0%, color-mix(in oklab, var(--accent) 4%, transparent) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}
