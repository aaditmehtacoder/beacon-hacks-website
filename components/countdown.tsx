"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

const TARGET = new Date(EVENT.date.starts).getTime();

function remaining(now: number) {
  const total = Math.max(0, Math.floor((TARGET - now) / 1000));
  return {
    done: total === 0,
    units: [
      { label: "Days", value: Math.floor(total / 86400) },
      { label: "Hours", value: Math.floor((total % 86400) / 3600) },
      { label: "Minutes", value: Math.floor((total % 3600) / 60) },
      { label: "Seconds", value: total % 60 },
    ],
  };
}

/**
 * Time to doors open. The page is static, so the numbers are worked out in
 * the browser: the first render is the same on the server and the client
 * (no hydration mismatch) and the clock fades in once it knows the time.
 * Seconds tick; under reduced motion the seconds go and it updates each
 * minute. Screen readers get one sentence, not a ticking clock.
 */
export function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(timer);
      setStill(reduce.matches);
      setNow(Date.now());
      timer = setInterval(() => setNow(Date.now()), reduce.matches ? 30_000 : 1000);
    };
    start();
    reduce.addEventListener("change", start);
    return () => {
      clearInterval(timer);
      reduce.removeEventListener("change", start);
    };
  }, []);

  const { done, units } = remaining(now ?? TARGET - 1000);
  const shown = still ? units.slice(0, 3) : units;
  const target = EVENT.date.confirmed ? "" : " · target date";

  return (
    <div className="flex flex-col gap-4 lg:items-end">
      <p className="text-[0.8125rem] text-moon-3">
        {EVENT.date.short}
        {target}
      </p>

      <p className="sr-only">
        Counting down to doors open on {EVENT.date.label}
        {EVENT.date.confirmed ? "" : ", our target date"}.
      </p>

      {done && now !== null ? (
        <p className="text-[1.75rem] leading-none font-bold font-stretch-125% tracking-[-0.02em] text-lamp">It’s hack day.</p>
      ) : (
        <ol
          aria-hidden="true"
          className={`flex transition-opacity duration-700 ease-out-quart ${now === null ? "opacity-0" : "opacity-100"}`}
        >
          {shown.map((unit, i) => (
            <li
              key={unit.label}
              className={`flex flex-col items-start ${i > 0 ? "ml-5 border-l border-moon/12 pl-5 sm:ml-6 sm:pl-6" : ""}`}
            >
              <span className="text-[2rem] leading-none font-bold font-stretch-[112.5%] tracking-[-0.02em] text-moon tabular-nums sm:text-[2.375rem]">
                {String(unit.value).padStart(2, "0")}
              </span>
              <span className="mt-2 text-[0.6875rem] text-moon-3">{unit.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
