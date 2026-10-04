import { createElement, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  /** Stagger in milliseconds. */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * A short rise on first paint, in plain CSS (`.rise-in` in globals.css).
 * Nothing starts hidden in the markup, so the content is there if the
 * animation never runs, and under reduced motion it does not run at all.
 * Used by the organiser pages.
 */
export function Reveal({ delay = 0, as = "div", className = "", style, children }: RevealProps) {
  return createElement(
    as,
    {
      className: `rise-in ${className}`.trim(),
      style: delay ? { animationDelay: `${delay}ms`, ...style } : style,
    },
    children,
  );
}
