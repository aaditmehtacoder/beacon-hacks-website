/**
 * The lamp and its beam. The dot sits on the baseline like a full stop; the
 * beam is a cone of light that opens toward the edge of the screen and
 * fades out. It is sized in em, so on any screen about the first half of
 * it shows before the edge. Decorative only.
 */
export function Lamp({
  id = "hero",
  onDark = false,
  length = 5,
}: {
  id?: string;
  onDark?: boolean;
  /** Beam length in em of the heading; shorter where a column ends. */
  length?: number;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative ml-[0.04em] inline-block size-[0.17em] rounded-full align-baseline ${
        onDark ? "bg-band-lamp" : "bg-beacon"
      }`}
    >
      <span
        className="beam-in pointer-events-none absolute top-1/2 left-1/2 block h-[1.15em] -translate-y-1/2"
        style={{ width: `${length}em` }}
      >
        <svg
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
          className={`block size-full ${onDark ? "text-band-lamp" : "text-beacon"}`}
          fill="none"
        >
          <defs>
            <linearGradient id={`${id}-beam-fill`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity={onDark ? 0.34 : 0.24} />
              <stop offset="0.4" stopColor="currentColor" stopOpacity={onDark ? 0.1 : 0.07} />
              <stop offset="0.8" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-beam-edge`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.6" />
              <stop offset="0.5" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="0.8" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 47 1000 0v100L0 53Z" fill={`url(#${id}-beam-fill)`} />
          <path
            d="M0 47 1000 0M0 53l1000 47"
            stroke={`url(#${id}-beam-edge)`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </span>
    </span>
  );
}
