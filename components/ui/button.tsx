import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full whitespace-nowrap font-medium " +
  "transition-[background-color,border-color,color,transform,box-shadow] duration-200 " +
  "active:translate-y-px disabled:opacity-50 disabled:pointer-events-none";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-ink text-paper border border-ink hover:bg-beacon hover:border-beacon hover:text-beacon-ink " +
    "shadow-[0_1px_2px_rgba(22,21,15,0.16)] hover:shadow-[0_6px_20px_rgba(242,161,0,0.32)]",
  ghost:
    "bg-transparent text-ink border border-line-hard hover:border-ink hover:bg-ink hover:text-paper",
  quiet:
    "bg-card text-ink border border-line hover:border-line-hard shadow-[0_1px_2px_rgba(22,21,15,0.05)]",
};

const SIZE: Record<Size, string> = {
  sm: "text-[0.8125rem] px-4 py-2",
  md: "text-[0.9375rem] px-6 py-3",
  lg: "text-base px-8 py-4",
};

function classes(variant: Variant, size: Size, extra?: string) {
  return [BASE, VARIANT[variant], SIZE[size], extra].filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...rest
}: ButtonProps) {
  return <button className={classes(variant, size, className)} {...rest} />;
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
