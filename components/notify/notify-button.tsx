"use client";

import { Button } from "@/components/ui/button";
import { useNotify } from "./notify-provider";
import { preloadNotifyDialog } from "./notify-modal";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<typeof Button>, "onClick">;

/** Any button that should open the notify-list dialog. */
export function NotifyButton({ children, ...rest }: Props) {
  const { openNotify } = useNotify();
  return (
    <Button
      type="button"
      onClick={() => openNotify()}
      onPointerEnter={preloadNotifyDialog}
      onFocus={preloadNotifyDialog}
      aria-haspopup="dialog"
      {...rest}
    >
      {children}
    </Button>
  );
}

/** The same, set as an inline text link inside a sentence. */
export function NotifyLink({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { openNotify } = useNotify();
  return (
    <button
      type="button"
      onClick={() => openNotify()}
      onPointerEnter={preloadNotifyDialog}
      onFocus={preloadNotifyDialog}
      aria-haspopup="dialog"
      className={`link cursor-pointer rounded-sm font-medium ${className}`}
    >
      {children}
    </button>
  );
}
