"use client";

import dynamic from "next/dynamic";
import { useNotify } from "./notify-provider";

/* The dialog, its form and its validation (zod) download only when someone
   opens it, so the page itself carries none of that weight. The triggers
   start the download on hover or focus, so it is there by the click. */
const NotifyDialog = dynamic(() => import("./notify-dialog"), { ssr: false });

export function preloadNotifyDialog() {
  void import("./notify-dialog");
}

/**
 * The updates list, for everyone who is not applying: parents, mentors,
 * judges, sponsors. One required field. Students are pointed at the
 * application instead.
 */
export function NotifyModal() {
  const { open } = useNotify();
  return open ? <NotifyDialog /> : null;
}
