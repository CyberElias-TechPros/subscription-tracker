"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";

export function MagneticButton({ children, className, ...props }: ButtonProps) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = (e.clientX - centerX) * 0.18;
    const deltaY = (e.clientY - centerY) * 0.28;
    setPos({ x: deltaX, y: deltaY });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <Button
      ref={ref}
      className={className}
      {...props}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        ...(props.style || {}),
      }}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </Button>
  );
}
