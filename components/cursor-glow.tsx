"use client";

import * as React from "react";

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
        className="absolute size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{
          left: pos.x,
          top: pos.y,
          background: `radial-gradient(circle at center, color-mix(in oklab, var(--accent) 14%, transparent) 0%, color-mix(in oklab, var(--accent) 6%, transparent) 30%, transparent 70%)`,
        }}
      />
    </div>
  );
}
