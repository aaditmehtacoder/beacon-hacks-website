import type { ReactNode } from "react";

/**
 * The visual contract for anything not yet secured: dashed edge, muted ink,
 * and a lock chip naming what would unlock it. Used instead of stating a
 * thing we cannot back up.
 */
export function Locked({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative rounded-2xl border border-dashed border-line-hard bg-paper-warm/50 p-6 ${className}`}
    >
      <LockChip>{label}</LockChip>
      <div className="mt-4 text-ink-2">{children}</div>
    </div>
  );
}

export function LockChip({ children }: { children: ReactNode }) {
  return (
    <span className="label inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2.5 py-1 text-ink-3">
      <LockIcon />
      {children}
    </span>
  );
}

export function LockIcon({ className = "size-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect
        x="2"
        y="5.2"
        width="8"
        height="5.3"
        rx="1.4"
        fill="currentColor"
        opacity="0.55"
      />
      <path
        d="M4 5.2V3.6a2 2 0 0 1 4 0v1.6"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
