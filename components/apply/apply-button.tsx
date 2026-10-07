"use client";

import type { MouseEvent, ReactNode } from "react";
import { buttonClasses, type Size, type Variant } from "@/components/ui/button";
import { openApply, preloadApply } from "./apply-dialog";

/**
 * Every Apply button. A real link to /apply, so it works before script
 * loads and opens in a new tab with a modifier key; a plain click opens
 * the pop-up instead.
 */
export function ApplyButton({
  variant = "lamp",
  size = "md",
  className,
  children,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openApply();
  }

  return (
    <a
      href="/apply"
      onClick={onClick}
      onPointerEnter={preloadApply}
      onFocus={preloadApply}
      aria-haspopup="dialog"
      className={buttonClasses(variant, size, className)}
    >
      {children}
    </a>
  );
}
