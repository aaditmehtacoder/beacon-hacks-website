import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "lamp" | "ink" | "outline" | "outline-night";
type Size = "sm" | "md" | "lg";

/* Pills with a semi-expanded label. Hover lifts a hair; press settles. */
const BASE =
  "relative inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap font-semibold font-stretch-[112.5%] tracking-[-0.005em] select-none " +
  "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out-quart " +
  "hover:-translate-y-px active:translate-y-0 " +
  "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0";

/**
 * lamp: the main action, on night or fog (Apply, Send).
 * ink: a solid secondary action on fog.
 * outline / outline-night: the quiet secondary action on fog / on night.
 */
const VARIANT: Record<Variant, string> = {
  lamp:
    "bg-lamp text-ink shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_10px_30px_-12px_rgb(255_199_44/0.7)] " +
    "hover:bg-lamp-hi hover:shadow-[0_1px_0_rgb(255_255_255/0.45)_inset,0_14px_36px_-12px_rgb(255_199_44/0.85)]",
  ink: "bg-ink text-fog hover:bg-ink-2",
  outline: "border border-line-2 bg-card text-ink hover:border-ink",
  "outline-night": "border border-moon/25 text-moon hover:border-moon/60 hover:bg-moon/5",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.875rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
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
  variant = "lamp",
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

export function LinkButton({ variant = "lamp", size = "md", className, ...rest }: LinkButtonProps) {
  return <Link className={classes(variant, size, className)} {...rest} />;
}

/** For mailto: and other non-route links that should look like buttons. */
export function AnchorButton({
  variant = "lamp",
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

/** A right arrow that slides a little on hover of its parent `group`. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-4 shrink-0 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5 ${className}`}
      aria-hidden="true"
      fill="none"
    >
      <path d="M2.5 8h10.5M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** An arrow up and out, for links that leave the site. */
export function OutArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`size-3.5 shrink-0 transition-transform duration-200 ease-out-quart group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      fill="none"
    >
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
