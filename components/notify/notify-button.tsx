"use client";

import { Button } from "@/components/ui/button";
import { useNotify } from "./notify-provider";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof Button>, "onClick">;

/** Any button that should open the notify-list dialog. */
export function NotifyButton({ children, ...rest }: Props) {
  const { openNotify } = useNotify();
  return (
    <Button type="button" onClick={() => openNotify()} {...rest}>
      {children}
    </Button>
  );
}
