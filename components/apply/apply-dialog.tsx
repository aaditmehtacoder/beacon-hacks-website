"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { EVENT } from "@/lib/event";
import { CloseIcon } from "@/components/ui/icons";

/* The form and its validation (zod) download only when someone reaches
   for an Apply button, so the page itself carries none of that weight. */
const ApplyForm = dynamic(() => import("@/components/apply-form").then((m) => m.ApplyForm), {
  ssr: false,
  loading: () => <div className="h-[26rem]" aria-hidden="true" />,
});

const OPEN = "beacon:apply";

export function preloadApply() {
  void import("@/components/apply-form");
}

export function openApply() {
  window.dispatchEvent(new Event(OPEN));
}

/**
 * The application as a pop-up, over whatever page the visitor is on. A
 * native <dialog>: the page behind goes inert, Tab stays inside, Escape
 * closes it, and focus goes back to the button that opened it. Clicking
 * outside the card closes it too. What was typed survives a close.
 */
export function ApplyDialog() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const onOpen = () => {
      const d = dialog.current;
      if (!d || d.open) return;
      setMounted(true);
      d.showModal();
    };
    window.addEventListener(OPEN, onOpen);
    return () => window.removeEventListener(OPEN, onOpen);
  }, []);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      aria-labelledby="apply-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="m-auto max-h-[calc(100dvh-1.5rem)] w-[min(38rem,calc(100%-1.5rem))] overflow-y-auto overscroll-contain rounded-[1.75rem] border-0 bg-card p-0 text-ink shadow-[0_50px_120px_-30px_rgb(6_13_27/0.65)] backdrop:bg-night/75 backdrop:backdrop-blur-[3px]"
    >
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-lamp" />
        <div className="flex items-start justify-between gap-4 px-6 pt-8 sm:px-9 sm:pt-9">
          <div>
            <h2 id="apply-dialog-title" className="text-[1.75rem] leading-none font-bold tracking-[-0.03em] sm:text-[2rem]">
              Apply to Beacon Hacks
            </h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-3">
              Free, grades 9 to 12, about a minute. {EVENT.date.short}
              {EVENT.date.confirmed ? "" : " (target date)"} in {EVENT.venue.city}.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="-mt-1 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-fog-2 hover:text-ink"
          >
            <CloseIcon className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="px-6 pt-7 pb-7 sm:px-9 sm:pb-9">{mounted ? <ApplyForm quick onDone={close} /> : null}</div>
      </div>
    </dialog>
  );
}
