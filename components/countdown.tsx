"use client";

import { useSyncExternalStore } from "react";
import { EVENT, TARGET_DATE_MS } from "@/lib/event";

/* The clock is an external store: it ticks once a second, the server
   snapshot is zero, and the real time arrives on the client without any
   state set inside an effect. */
function subscribe(onTick: () => void) {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
}
const nowSeconds = () => Math.floor(Date.now() / 1000);
const serverSeconds = () => 0;

function split(secondsLeft: number) {
  const s = Math.max(0, secondsLeft);
  return [
    ["Days", Math.floor(s / 86400)],
    ["Hours", Math.floor((s % 86400) / 3600)],
    ["Min", Math.floor((s % 3600) / 60)],
    ["Sec", s % 60],
  ] as const;
}

/**
 * Counts down to the target date. It is a target: the date locks when the
 * venue signs off, and the label says so rather than letting a ticking
 * clock imply a promise.
 */
export function Countdown({ className = "" }: { className?: string }) {
  const now = useSyncExternalStore(subscribe, nowSeconds, serverSeconds);
  const ready = now > 0;
  const left = Math.floor(TARGET_DATE_MS / 1000) - now;
  const parts = split(left);
  const today = ready && left <= 0;

  return (
    <div className={className} aria-live="off">
      <p className="label text-band-ink/50">
        {today ? "Today" : `Until ${EVENT.targetDateLabel}`}
        <span className="text-band-ink/35"> · target, not locked</span>
      </p>
      <div
        className={`mt-2 flex gap-4 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
        aria-hidden={!ready}
      >
        {parts.map(([unit, value], i) => (
          <div key={unit} className="flex min-w-[3.25rem] flex-col">
            <span className="font-display text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
              {i === 0 ? value : String(value).padStart(2, "0")}
            </span>
            <span className="label mt-1 text-band-ink/45">{unit}</span>
          </div>
        ))}
      </div>
      <span className="sr-only">
        {ready ? `${parts[0][1]} days, ${parts[1][1]} hours until ${EVENT.targetDayLabel}, the target date.` : ""}
      </span>
    </div>
  );
}
