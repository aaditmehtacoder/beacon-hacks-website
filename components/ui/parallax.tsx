"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";

/**
 * Moves its children a fraction of the page scroll, for the hero only.
 * Negative speed reads as nearer (it leaves faster than the page); positive
 * reads as farther away. Small numbers: this is depth, not a ride.
 */
export function Parallax({
  children,
  speed = -0.1,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1200], [0, 1200 * speed]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}
