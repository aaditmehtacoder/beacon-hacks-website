"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

const FROM = { y: "128%", rotate: 2.5 };
const TO = { y: 0, rotate: 0 };
const EASE = [0.22, 0.7, 0.25, 1] as const;

/**
 * A line of display type rising into view from behind its own baseline.
 * The clip extends past the line box so tight leading does not shave the
 * ascenders, and the slight rotation lets the word settle rather than stop.
 *
 * On mount by default (the hero); `inView` waits until it scrolls in. The
 * observer watches the outer, unclipped span on purpose: the inner one
 * starts translated outside the clip region, and an observer on it would
 * never report it visible.
 */
export function TextReveal({
  children,
  delay = 0,
  inView = false,
  className = "",
}: {
  children: ReactNode;
  /** Milliseconds, to match <Reveal>. */
  delay?: number;
  inView?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mask = useRef<HTMLSpanElement>(null);
  const seen = useInView(mask, { once: true, margin: "0px 0px -12% 0px" });

  if (reduce) {
    return <span className={`block ${className}`}>{children}</span>;
  }

  const shown = inView ? seen : true;

  return (
    <span ref={mask} className={`block [clip-path:inset(-0.25em_0)] ${className}`}>
      <motion.span
        className="block origin-bottom-left"
        initial={FROM}
        animate={shown ? TO : FROM}
        transition={{
          duration: inView ? 0.9 : 1.05,
          delay: delay / 1000,
          ease: EASE,
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}
