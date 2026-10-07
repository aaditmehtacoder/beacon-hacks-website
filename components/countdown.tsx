"use client";

import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import { CalendarIcon } from "./ui/icons";

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
    <div>
      <p className="flex items-center gap-2.5 text-[0.9375rem] text-moon-2">
        <CalendarIcon className="size-[1.125rem] text-lamp" />
        <span>
          {EVENT.date.label}
          <span className="text-moon-3">{target}</span>
        </span>
      </p>

      <p className="sr-only">
        Counting down to doors open on {EVENT.date.label}
        {EVENT.date.confirmed ? "" : ", our target date"}.
      </p>

      {done && now !== null ? (
        <p className="mt-5 text-[clamp(2.25rem,4.5vw,3.5rem)] leading-none font-bold font-stretch-125% tracking-[-0.03em] text-lamp">
          It’s hack day.
        </p>
      ) : (
        <ol
          aria-hidden="true"
          className={`mt-5 flex items-start transition-opacity duration-700 ease-out-quart ${now === null ? "opacity-0" : "opacity-100"}`}
        >
          {shown.map((unit, i) => (
            <li key={unit.label} className="flex items-start">
              {i > 0 ? (
                <span className="px-2 text-[clamp(2.5rem,5vw,4.25rem)] leading-none font-bold text-lamp/70 sm:px-3">:</span>
              ) : null}
              <span className="flex flex-col items-center">
                <span className="text-[clamp(2.5rem,5vw,4.25rem)] leading-none font-bold font-stretch-[118%] tracking-[-0.03em] text-moon tabular-nums">
                  {String(unit.value).padStart(2, "0")}
                </span>
                <span className="mt-2.5 text-[0.6875rem] font-semibold font-stretch-[112.5%] tracking-[0.16em] text-moon-3 uppercase">
                  {unit.label}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
