"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NotifyContext = {
  open: boolean;
  seedEmail: string;
  openNotify: (seedEmail?: string) => void;
  closeNotify: () => void;
};

const Ctx = createContext<NotifyContext | null>(null);

export function NotifyProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [seedEmail, setSeedEmail] = useState("");

  const openNotify = useCallback((email = "") => {
    if (email) setSeedEmail(email);
    setOpen(true);
  }, []);

  const closeNotify = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ open, seedEmail, openNotify, closeNotify }),
    [open, seedEmail, openNotify, closeNotify],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNotify() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useNotify must be used inside <NotifyProvider>");
  return ctx;
}
