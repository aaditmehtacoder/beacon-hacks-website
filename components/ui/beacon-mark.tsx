import { useId } from "react";

/**
 * The mark: the lamp seen from above, two beams turning around it, the same
 * object as the hero. Pairs with the wordmark. Colour comes from
 * currentColor, so `text-beacon` on the parent lights it. Still under
 * reduced motion.
 */
export function BeaconMark({ className = "size-5" }: { className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const beam = `beam-${id}`;
  const glow = `glow-${id}`;

  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={beam} gradientUnits="userSpaceOnUse" x1="12" y1="12" x2="24" y2="12">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="currentColor" stopOpacity="0.85" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* the lens rings */}
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="1" />
      <circle cx="12" cy="12" r="6.9" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" />

      {/* two beams, turning */}
      <g className="motion-safe:animate-sweep [transform-box:fill-box] [transform-origin:center]">
        <path d="M12 12 L24 8.4 L24 15.6 Z" fill={`url(#${beam})`} />
        <path d="M12 12 L24 8.4 L24 15.6 Z" fill={`url(#${beam})`} transform="rotate(180 12 12)" />
      </g>

      {/* the lamp */}
      <circle cx="12" cy="12" r="5.2" fill={`url(#${glow})`} className="motion-safe:animate-pulse-dot [transform-box:fill-box] [transform-origin:center]" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}
