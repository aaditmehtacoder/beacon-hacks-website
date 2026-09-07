"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import type { ElementType } from "react";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Stagger in milliseconds. */
  delay?: number;
  as?: ElementType;
};

/**
 * The one entrance animation the site uses. Fires once, on the way in,
 * and is a no-op when the visitor asked for reduced motion.
 */
export function Reveal({
  delay = 0,
  as = "div",
  children,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as as "div"] ?? motion.div;

  if (reduce) {
    const Plain = as as ElementType;
    return <Plain {...(rest as object)}>{children}</Plain>;
  }

  return (
    <Tag
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: [0.22, 0.7, 0.25, 1],
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
