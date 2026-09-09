"use client";

import { useId } from "react";
import { useTheme } from "./theme-provider";

const RAYS = [
  [12, 1.5, 12, 3.5],
  [12, 20.5, 12, 22.5],
  [1.5, 12, 3.5, 12],
  [20.5, 12, 22.5, 12],
  [4.6, 4.6, 6.0, 6.0],
  [18.0, 18.0, 19.4, 19.4],
  [18.0, 6.0, 19.4, 4.6],
  [4.6, 19.4, 6.0, 18.0],
] as const;

/**
 * Sun and moon are the same disc. In light the rays are out and the disc is
 * whole; in dark the rays fold in and a second circle slides across to bite
 * a crescent out of it. Both states are in the DOM and CSS picks between
 * them from `data-theme` on <html>, so the icon is right on first paint.
 */
function LampIcon() {
  const maskId = `lamp-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[1.125rem] [&_*]:[transform-box:fill-box] [&_*]:[transform-origin:center]"
      aria-hidden="true"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse">
        <rect x="0" y="0" width="24" height="24" fill="white" />
        <circle className="lamp__cut" cx="22" cy="2" r="7.5" fill="black" />
      </mask>

      <circle
        className="lamp__disc"
        cx="12"
        cy="12"
        r="5"
        fill="currentColor"
        mask={`url(#${maskId})`}
      />

      <g
        className="lamp__rays"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      >
        {RAYS.map(([x1, y1, x2, y2]) => (
          <line key={`${x1}-${y1}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        ))}
      </g>
    </svg>
  );
}

/**
 * The header control. Flips to the opposite of whatever is on screen, which
 * also settles a visitor who was still on "system".
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      className={`grid size-9 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-line-hard hover:text-ink ${className}`}
    >
      <LampIcon />
      <span className="sr-only" data-theme-when="light">
        Switch to the dark theme
      </span>
      <span className="sr-only" data-theme-when="dark">
        Switch to the light theme
      </span>
    </button>
  );
}
