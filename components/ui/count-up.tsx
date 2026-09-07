"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
};

/**
 * Counts from zero to `value` the first time it scrolls into view.
 * Renders the final number immediately for reduced motion and for
 * anyone reaching the page without JavaScript running yet.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  durationMs = 1100,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (reduce || !ref.current) return;
    const node = ref.current;
    setShown(0);

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();

        const t0 = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - t0) / durationMs);
          // easeOutExpo — fast off the line, settles on the number
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setShown(Math.round(value * eased));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    io.observe(node);
    return () => io.disconnect();
  }, [reduce, value, durationMs]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
