"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "motion/react";
import { createElement, type ElementType, type ReactNode } from "react";

type Variant = "rise" | "tilt";

type RevealProps = HTMLMotionProps<"div"> & {
  /** Stagger in milliseconds. */
  delay?: number;
  as?: ElementType;
  /** rise: fade up. tilt: fade up while settling flat from a slight lean,
      which is what cards get so a grid arrives with some depth. */
  variant?: Variant;
};

const EASE = [0.22, 0.7, 0.25, 1] as const;

const FROM: Record<Variant, Record<string, number>> = {
  rise: { opacity: 0, y: 18 },
  tilt: { opacity: 0, y: 28, rotateX: 9 },
};

const TO: Record<Variant, Record<string, number>> = {
  rise: { opacity: 1, y: 0 },
  tilt: { opacity: 1, y: 0, rotateX: 0 },
};

/**
 * The one entrance animation the site uses. Fires once, on the way in,
 * and is a no-op when the visitor asked for reduced motion.
 */
export function Reveal({
  delay = 0,
  as = "div",
  variant = "rise",
  children,
  style,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();
  const Tag = motion[as as "div"] ?? motion.div;

  /* createElement rather than <Tag>: three.js's JSX augmentation makes a
     generic ElementType's children type collapse to never. */
  if (reduce) {
    return createElement(as, rest as object, children as ReactNode);
  }

  return (
    <Tag
      initial={FROM[variant]}
      whileInView={TO[variant]}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: variant === "tilt" ? 0.85 : 0.7,
        delay: delay / 1000,
        ease: EASE,
      }}
      style={
        variant === "tilt"
          ? { transformPerspective: 1100, transformOrigin: "50% 0%", ...style }
          : style
      }
      {...rest}
    >
      {children}
    </Tag>
  );
}
