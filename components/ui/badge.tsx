import * as React from "react"
import { cn } from "@/lib/utils"

/** Small category chip with a colored dot. */
export function Badge({
  className,
  color,
  ...props
}: React.ComponentProps<"span"> & { color?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    >
      {color && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      {props.children}
    </span>
  )
}
