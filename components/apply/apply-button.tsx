import type { ReactNode } from "react";
import { buttonClasses, type Size, type Variant } from "@/components/ui/button";
import { EVENT } from "@/lib/event";

/** Every Apply button: the registration page on Luma, in a new tab. */
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
  return (
    <a
      href={EVENT.applications.url}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses(variant, size, className)}
    >
      {children}
      <span className="sr-only"> (Luma, opens in a new tab)</span>
    </a>
  );
}
