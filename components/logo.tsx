/**
 * Bespoke logomark: a paper receipt with a mint "charge" dot,
 * set on an ink chip. Works at 16px (favicon) and beyond.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <path
        d="M10 7.5h12a1 1 0 0 1 1 1v15.2l-2.33-1.6-2.34 1.6-2.33-1.6-2.33 1.6-2.34-1.6L9 23.7V8.5a1 1 0 0 1 1-1Z"
        fill="var(--card)"
      />
      <path
        d="M12.5 11.5h7M12.5 14.5h7M12.5 17.2h4"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="19.4" cy="18" r="1.5" fill="var(--accent)" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="size-7 shrink-0" />
      <span className="font-semibold tracking-tight">Subscription Tracker</span>
    </span>
  )
}
