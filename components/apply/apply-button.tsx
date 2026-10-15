import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses, type Size, type Variant } from "@/components/ui/button";

/** Every Apply button: a link to the application at /apply. */
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
    <Link href="/apply" className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}
