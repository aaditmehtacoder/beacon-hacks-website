import type { CSSProperties } from "react";

/*
 * The night over the bay, drawn for the hero and the closing: stars, the
 * hills across the water, and a lighthouse on its headland whose beam
 * sweeps the sky and flashes as it turns toward you (globals.css has the
 * motion). All of it is decoration, hidden from assistive tech, and
 * rendered on the server with no client script.
 */

/* A seeded scatter, so the sky is the same on every render. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STARS = (() => {
  const rand = seeded(1301);
  return Array.from({ length: 110 }, () => ({
    x: Math.round(rand() * 1600),
    /* thicker toward the top of the sky */
    y: Math.round(rand() ** 1.7 * 620),
    r: +(0.45 + rand() * rand() * 1.5).toFixed(2),
    o: +(0.22 + rand() * 0.62).toFixed(2),
  }));
})();

/* Glints on the water: short near the horizon, longer close by. */
const GLINTS = (() => {
  const rand = seeded(77);
  return Array.from({ length: 30 }, () => {
    const depth = rand();
    return {
      x: Math.round(rand() * 1500),
      y: Math.round(306 + depth ** 1.4 * 186),
      w: Math.round(14 + depth * 110 * (0.5 + rand())),
      o: +(0.05 + rand() * 0.08).toFixed(3),
    };
  });
})();

/** The sky behind everything: a deep gradient and the stars. */
export function Sky({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--color-sky)_0%,var(--color-night)_52%,color-mix(in_oklab,var(--color-horizon)_60%,var(--color-night))_100%)] ${className}`}
    >
      <svg className="absolute inset-0 size-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMin slice">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} className="fill-moon" opacity={s.o} />
        ))}
      </svg>
    </div>
  );
}

/*
 * The shore is drawn in a 1600 x 500 box pinned to the bottom right of
 * its container and scaled to cover it, so the lighthouse stays in view
 * on a phone while the hills run off to the left. The light itself is
 * HTML (it animates on the compositor), placed with the same scale:
 * --s is one drawing unit in CSS pixels.
 */
const W = 1600;
const H = 500;
/* The lighthouse is drawn at its base (1390, 262) and scaled up by
   TOWER around it; the lamp sits 130 units above the base. */
const TOWER = 1.2;
const LAMP = { x: 1390, y: 262 - 130 * TOWER };

/** Places a box of `size` drawing units centred on the lamp. */
function atLamp(size: number): CSSProperties {
  return {
    left: `calc(100% - ${W - LAMP.x + size / 2} * var(--s))`,
    top: `calc(100% - ${H - LAMP.y + size / 2} * var(--s))`,
    width: `calc(${size} * var(--s))`,
    height: `calc(${size} * var(--s))`,
  };
}

const BEAM_LENGTH = 1500;
/* Tall enough for the wedge, which rises a few degrees above level. */
const BEAM_SPREAD = 1200;

export function Shore({ id, className = "" }: { id: string; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute [container-type:size] ${className}`}
      style={{ "--s": `max(100cqw / ${W}, 100cqh / ${H})` } as CSSProperties}
    >
      {/* the lamp's standing glow */}
      <div
        className="absolute rounded-full bg-[radial-gradient(closest-side,rgb(255_222_120/0.55),rgb(255_199_44/0.16)_50%,transparent)]"
        style={atLamp(300)}
      />

      {/* the beam: a soft wedge of light from the lamp */}
      <div
        className="beam absolute"
        style={{
          left: `calc(100% - ${W - LAMP.x} * var(--s))`,
          top: `calc(100% - ${H - LAMP.y + BEAM_SPREAD / 2} * var(--s))`,
          width: `calc(${BEAM_LENGTH} * var(--s))`,
          height: `calc(${BEAM_SPREAD} * var(--s))`,
          background:
            "conic-gradient(from 0deg at 0% 50%, transparent 69deg, rgb(255 214 102 / 0.08) 73deg, rgb(255 222 128 / 0.32) 80deg, rgb(255 234 160 / 0.46) 83deg, rgb(255 222 128 / 0.32) 86deg, rgb(255 214 102 / 0.08) 93deg, transparent 97deg)",
          maskImage: "linear-gradient(to right, #000 0%, rgb(0 0 0 / 0.75) 30%, rgb(0 0 0 / 0.3) 68%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to right, #000 0%, rgb(0 0 0 / 0.75) 30%, rgb(0 0 0 / 0.3) 68%, transparent 100%)",
        }}
      />

      <svg
        className="absolute inset-0 size-full overflow-visible"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMaxYMax slice"
      >
        <defs>
          <linearGradient id={`${id}-glow`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--color-horizon)", stopOpacity: 0 }} />
            <stop offset="1" style={{ stopColor: "var(--color-horizon)", stopOpacity: 0.55 }} />
          </linearGradient>
          <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--color-sea)" }} />
            <stop offset="1" style={{ stopColor: "var(--color-night)" }} />
          </linearGradient>
          <linearGradient id={`${id}-lantern`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6d6" />
            <stop offset="1" style={{ stopColor: "var(--color-lamp)" }} />
          </linearGradient>
          <linearGradient id={`${id}-trail`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--color-lamp)", stopOpacity: 0.32 }} />
            <stop offset="1" style={{ stopColor: "var(--color-lamp)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* the glow along the horizon */}
        <rect x="-200" y="-260" width="2000" height="562" fill={`url(#${id}-glow)`} />

        {/* the hills across the bay */}
        <path
          className="fill-hill-far"
          d="M-40 300V266C30 262 90 249 160 245c62-3 102 10 162 7 70-4 112-22 192-24 80-2 122 18 202 22 80 4 128-11 198-13 70-2 124 13 194 24 52 8 98 18 150 28l10 15Z"
        />
        {/* the near hills */}
        <path
          className="fill-hill"
          d="M-40 300V222c62-6 104-26 170-30 62-4 104 16 158 22 60 7 100-10 160-6 62 4 106 31 168 58 40 17 70 26 104 34Z"
        />

        {/* the water */}
        <rect x="-200" y="300" width="2000" height="220" fill={`url(#${id}-sea)`} />
        {GLINTS.map((g, i) => (
          <rect key={i} x={g.x} y={g.y} width={g.w} height="1.6" rx="0.8" className="fill-moon" opacity={g.o} />
        ))}

        {/* the lamp's path across the water */}
        <rect x={LAMP.x - 26} y="318" width="52" height="182" fill={`url(#${id}-trail)`} />
        {Array.from({ length: 14 }, (_, i) => {
          const w = 8 + i * 4.2;
          return (
            <rect
              key={i}
              x={LAMP.x - w / 2 + (i % 2 ? 3 : -3)}
              y={322 + i * 12.5}
              width={w}
              height="2.2"
              rx="1.1"
              className="fill-lamp"
              opacity={+(0.78 - i * 0.05).toFixed(2)}
            />
          );
        })}

        {/* the headland */}
        <path
          className="fill-land"
          d="M1148 306c36-8 66-22 100-30 30-7 52-14 82-14l270-6v66c-60-4-118 2-178-2-60-4-118 2-178-4-38-4-66-3-96-10Z"
        />
        <path
          d="M1148 306c36-8 66-22 100-30 30-7 52-14 82-14l270-6"
          fill="none"
          className="stroke-horizon"
          strokeWidth="1.5"
          strokeOpacity="0.7"
        />

        <g transform={`translate(1390 262) scale(${TOWER}) translate(-1390 -262)`}>
          {/* the keeper's house */}
          <g className="fill-land">
            <path d="M1428 262v-24h60v24Z" />
            <path d="M1422 240l36-19 36 19Z" />
            <rect x="1474" y="219" width="7" height="13" />
          </g>
          <rect x="1440" y="245" width="10" height="9" rx="1" className="fill-lamp" opacity="0.9" />
          <rect x="1466" y="245" width="10" height="9" rx="1" className="fill-lamp" opacity="0.55" />

          {/* the tower: moonlit on the left, in shadow on the right */}
          <path className="fill-tower" d="M1371 262l6-110h13v110Z" />
          <path className="fill-tower-2" d="M1390 262V152h13l6 110Z" />
          <path className="fill-land" opacity="0.75" d="M1373.2 222.6l.9-16h31.8l.9 16Z M1375.4 182.2l.8-14.6h27.6l.8 14.6Z" />
          <rect x="1387" y="249" width="6" height="13" rx="1" className="fill-land" />

          {/* the gallery and its rail */}
          <rect x="1365" y="146" width="50" height="6" rx="1" className="fill-land" />
          <path d="M1367 139.5h46M1367 139.5v6.5M1375 139.5v6.5M1383 139.5v6.5M1397 139.5v6.5M1405 139.5v6.5M1413 139.5v6.5" className="stroke-land" strokeWidth="1.4" fill="none" />

          {/* the lantern */}
          <rect x="1379" y="118" width="22" height="28" fill={`url(#${id}-lantern)`} />
          <path d="M1386 118v28M1394 118v28" className="stroke-land" strokeOpacity="0.55" strokeWidth="1.2" />

          {/* the cupola */}
          <path className="fill-land" d="M1374 119c4-14 9-20 16-21 7 1 12 7 16 21Z" />
          <circle cx="1390" cy="96" r="3.2" className="fill-land" />
          <path d="M1390 93v-9" className="stroke-land" strokeWidth="1.4" />
        </g>
      </svg>

      {/* the glare as the light turns toward you */}
      <div
        className="lamp-flash absolute size-0"
        style={{ left: `calc(100% - ${W - LAMP.x} * var(--s))`, top: `calc(100% - ${H - LAMP.y} * var(--s))` }}
      >
        <div
          className="absolute -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_248_220/0.95),rgb(255_222_120/0.5)_20%,rgb(255_199_44/0.14)_48%,transparent_72%)]"
          style={{ width: "calc(560 * var(--s))", height: "calc(560 * var(--s))" }}
        />
        <div
          className="absolute -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(255_240_190/0.7),transparent)]"
          style={{ width: "calc(1400 * var(--s))", height: "calc(26 * var(--s))" }}
        />
      </div>
    </div>
  );
}
