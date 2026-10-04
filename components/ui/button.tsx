import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "beacon" | "primary" | "ghost" | "quiet" | "lamp" | "lamp-flat" | "ghost-dark";
type Size = "sm" | "md" | "lg";

/* Pills with a heavy label. The hard shadow sits under the button and the
   button presses down into it on click. */
const BASE =
  "relative inline-flex items-center justify-center gap-2.5 rounded-full whitespace-nowrap font-display font-extrabold tracking-[-0.01em] select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-150 " +
  "disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55";

/**
 * beacon: the yellow action on cream (Apply, Send).
 * lamp: the yellow action on a dark band; lamp-flat is the same without
 * the shadow, for the header.
 * primary: an ink pill, for organiser pages.
 * ghost / ghost-dark: the outlined secondary action, on cream / on dark.
 * quiet: a soft control for toolbars.
 */
const VARIANT: Record<Variant, string> = {
  beacon:
    "bg-beacon text-beacon-ink border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] " +
    "hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-ink)] " +
    "disabled:translate-y-0 disabled:shadow-[4px_4px_0_var(--color-ink)]",
  lamp:
    "bg-beacon text-beacon-ink border-2 border-beacon shadow-[5px_5px_0_var(--color-paper)] " +
    "hover:-translate-y-0.5 hover:shadow-[7px_7px_0_var(--color-paper)] active:translate-y-0.5 active:shadow-[1px_1px_0_var(--color-paper)]",
  "lamp-flat":
    "bg-beacon text-beacon-ink border-2 border-beacon hover:bg-beacon-hi hover:border-beacon-hi hover:-translate-y-px active:translate-y-px",
  primary:
    "bg-ink text-paper border-2 border-ink hover:bg-ink-2 hover:border-ink-2 active:translate-y-px",
  ghost:
    "bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper active:translate-y-px",
  "ghost-dark":
    "bg-transparent text-band-ink border-2 border-band-ink/45 hover:border-band-ink hover:bg-band-ink hover:text-band active:translate-y-px",
  quiet:
    "bg-card text-ink border-2 border-line hover:border-ink active:translate-y-px",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[0.875rem] sm:px-4",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-[3.25rem] px-5 text-base sm:px-6",
};

function classes(variant: Variant, size: Size, extra?: string) {
  return [BASE, VARIANT[variant], SIZE[size], extra].filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  /** Shows a spinner, keeps the label for screen readers, and blocks clicks. */
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={classes(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: LinkButtonProps) {
  return <Link className={classes(variant, size, className)} {...rest} />;
}

/** For mailto: and other non-route links that should look like buttons. */
export function AnchorButton({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={classes(variant, size, className)} {...rest} />;
}

function Spinner() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 motion-safe:animate-spin" aria-hidden="true" fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14.25 8A6.25 6.25 0 0 0 8 1.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** A north-east arrow that nudges on hover of its parent `group`. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      fill="none"
    >
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** A ✦, the small star used as a bullet and a divider. Decorative. */
export function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`shrink-0 ${className}`} aria-hidden="true" fill="currentColor">
      <path d="M8 0c.5 4.2 3.8 7.5 8 8-4.2.5-7.5 3.8-8 8-.5-4.2-3.8-7.5-8-8 4.2-.5 7.5-3.8 8-8Z" />
    </svg>
  );
}
