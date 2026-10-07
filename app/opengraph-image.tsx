import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EVENT } from "@/lib/event";

const WHERE = EVENT.venue.name ? `Hosted by ${EVENT.venue.name} in ${EVENT.venue.label}.` : `In ${EVENT.venue.label}.`;
export const alt = `Beacon Hacks: ${EVENT.tagline} ${WHERE} Target date ${EVENT.date.label}. Early applications are open.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Read once at module scope: the fonts do not depend on the request. */
const fontDir = join(process.cwd(), "assets/og");
const display = await readFile(join(fontDir, "MonaSans-Expanded-ExtraBold.ttf"));
const label = await readFile(join(fontDir, "MonaSans-SemiExpanded-Bold.ttf"));
const text = await readFile(join(fontDir, "MonaSans-Medium.ttf"));

const MOON = "#f7f3eb";
const MOON_2 = "#c8d2de";
const LAMP = "#ffc72c";

/* A seeded scatter, so the card is the same on every build. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/*
 * The night scene from the hero, drawn as one SVG over the whole card
 * (1600 x 840 units, 0.75 px each). The shore is the hero's drawing moved
 * down to the bottom of the card; the beam rises from the lamp across the
 * sky behind the title.
 */
function scene() {
  const rand = seeded(1301);
  const stars = Array.from({ length: 90 }, () => {
    const x = Math.round(rand() * 1600);
    const y = Math.round(rand() ** 1.7 * 520);
    const r = (0.6 + rand() * rand() * 1.8).toFixed(2);
    const o = (0.25 + rand() * 0.6).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${MOON}" opacity="${o}"/>`;
  }).join("");

  const glintRand = seeded(77);
  const glints = Array.from({ length: 26 }, () => {
    const depth = glintRand();
    const x = Math.round(glintRand() * 1500);
    const y = Math.round(306 + depth ** 1.4 * 186);
    const w = Math.round(14 + depth * 110 * (0.5 + glintRand()));
    const o = (0.05 + glintRand() * 0.08).toFixed(3);
    return `<rect x="${x}" y="${y}" width="${w}" height="1.6" rx="0.8" fill="${MOON}" opacity="${o}"/>`;
  }).join("");

  const trail = Array.from({ length: 14 }, (_, i) => {
    const w = 8 + i * 4.2;
    const x = 1390 - w / 2 + (i % 2 ? 3 : -3);
    return `<rect x="${x}" y="${322 + i * 12.5}" width="${w}" height="2.2" rx="1.1" fill="${LAMP}" opacity="${(0.78 - i * 0.05).toFixed(2)}"/>`;
  }).join("");

  /* The lamp, in card units: the shore is shifted down by 340, and the
     lighthouse is scaled 1.2 about its base (1390, 262). */
  const lx = 1390;
  const ly = 340 + 262 - 130 * 1.2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1600 840">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#03070f"/><stop offset="0.55" stop-color="#060d1b"/><stop offset="1" stop-color="#14213b"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b2b4c" stop-opacity="0"/><stop offset="1" stop-color="#1b2b4c" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#14213a"/><stop offset="1" stop-color="#060d1b"/>
    </linearGradient>
    <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#ffe9a0" stop-opacity="0.55"/><stop offset="0.45" stop-color="${LAMP}" stop-opacity="0.16"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="lamp-glow">
      <stop offset="0" stop-color="#fff2c4" stop-opacity="0.9"/><stop offset="0.25" stop-color="${LAMP}" stop-opacity="0.35"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="trail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${LAMP}" stop-opacity="0.32"/><stop offset="1" stop-color="${LAMP}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="lantern" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff6d6"/><stop offset="1" stop-color="${LAMP}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <rect width="1600" height="840" fill="url(#sky)"/>
  ${stars}
  <path d="M${lx} ${ly}L-260 ${ly - 610}L-260 ${ly - 250}Z" fill="url(#beam)" filter="url(#soft)"/>
  <circle cx="${lx}" cy="${ly}" r="150" fill="url(#lamp-glow)"/>
  <g transform="translate(0 340)">
    <rect x="0" y="-300" width="1600" height="602" fill="url(#glow)"/>
    <path fill="#101b31" d="M0 300V266C30 262 90 249 160 245c62-3 102 10 162 7 70-4 112-22 192-24 80-2 122 18 202 22 80 4 128-11 198-13 70-2 124 13 194 24 52 8 98 18 150 28l10 15Z"/>
    <path fill="#0a1324" d="M0 300V222c62-6 104-26 170-30 62-4 104 16 158 22 60 7 100-10 160-6 62 4 106 31 168 58 40 17 70 26 104 34Z"/>
    <rect x="0" y="300" width="1600" height="200" fill="url(#sea)"/>
    ${glints}
    <rect x="1364" y="318" width="52" height="182" fill="url(#trail)"/>
    ${trail}
    <path fill="#03080f" d="M1148 306c36-8 66-22 100-30 30-7 52-14 82-14l270-6v66c-60-4-118 2-178-2-60-4-118 2-178-4-38-4-66-3-96-10Z"/>
    <g transform="translate(1390 262) scale(1.2) translate(-1390 -262)">
      <path fill="#03080f" d="M1428 262v-24h60v24ZM1422 240l36-19 36 19Z"/>
      <rect x="1474" y="219" width="7" height="13" fill="#03080f"/>
      <rect x="1440" y="245" width="10" height="9" rx="1" fill="${LAMP}" opacity="0.9"/>
      <rect x="1466" y="245" width="10" height="9" rx="1" fill="${LAMP}" opacity="0.55"/>
      <path fill="#8794a9" d="M1371 262l6-110h13v110Z"/>
      <path fill="#5a6780" d="M1390 262V152h13l6 110Z"/>
      <path fill="#03080f" opacity="0.75" d="M1373.2 222.6l.9-16h31.8l.9 16ZM1375.4 182.2l.8-14.6h27.6l.8 14.6Z"/>
      <rect x="1365" y="146" width="50" height="6" rx="1" fill="#03080f"/>
      <path d="M1367 139.5h46M1367 139.5v6.5M1375 139.5v6.5M1383 139.5v6.5M1397 139.5v6.5M1405 139.5v6.5M1413 139.5v6.5" stroke="#03080f" stroke-width="1.4" fill="none"/>
      <rect x="1379" y="118" width="22" height="28" fill="url(#lantern)"/>
      <path fill="#03080f" d="M1374 119c4-14 9-20 16-21 7 1 12 7 16 21Z"/>
      <circle cx="1390" cy="96" r="3.2" fill="#03080f"/>
    </g>
  </g>
</svg>`;
}

const SCENE = `data:image/svg+xml;utf8,${encodeURIComponent(scene())}`;

/** The share card, drawn from the same event data as the page. */
export default async function Image() {
  const facts = [
    EVENT.date.short + (EVENT.date.confirmed ? "" : " (target)"),
    EVENT.venue.place ? `${EVENT.venue.place}, ${EVENT.venue.city}` : EVENT.venue.label,
    "Grades 9–12",
    "Free",
  ];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#060d1b",
        fontFamily: "Mona Text",
        color: MOON,
      }}
    >
      <img src={SCENE} width={1200} height={630} alt="" style={{ position: "absolute", left: 0, top: 0 }} />

      <div style={{ display: "flex", flexDirection: "column", position: "relative", padding: "84px 72px 0", width: "100%" }}>
        <div style={{ display: "flex", fontFamily: "Mona Display", fontSize: 116, lineHeight: 0.9, letterSpacing: -5 }}>
          Beacon Hacks
        </div>
        <div style={{ display: "flex", marginTop: 30, fontSize: 32, lineHeight: 1.35, color: MOON_2, maxWidth: 640 }}>
          A free, one-day hackathon for Bay Area high school students.
        </div>

        <div style={{ display: "flex", position: "absolute", left: 72, bottom: 56, gap: 22, alignItems: "center" }}>
          {facts.map((fact, i) => (
            <div key={fact} style={{ display: "flex", alignItems: "center", gap: 22 }}>
              {i > 0 ? <div style={{ display: "flex", width: 6, height: 6, borderRadius: 6, background: LAMP }} /> : null}
              <div style={{ display: "flex", fontFamily: "Mona Label", fontSize: 22, color: MOON }}>{fact}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Mona Display", data: display, weight: 800, style: "normal" },
        { name: "Mona Label", data: label, weight: 700, style: "normal" },
        { name: "Mona Text", data: text, weight: 500, style: "normal" },
      ],
    },
  );
}
