import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { EVENT } from "@/lib/event";

export const alt = `Beacon Hacks: ${EVENT.tagline} Target date ${EVENT.date.label}, ${EVENT.venue.label}. Early applications are open.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/* Read once at module scope: the fonts do not depend on the request. */
const fontDir = join(process.cwd(), "assets/og");
const display = await readFile(join(fontDir, "Bricolage-Display-800.ttf"));
const text = await readFile(join(fontDir, "Bricolage-Text-700.ttf"));

const NIGHT = "#1b1712";
const CREAM = "#fbf6ec";
const YELLOW = "#ffc72c";
const CARD = "#fffdf8";
const INK_3 = "#62584a";

/* The lamp's beam: a wedge of light that fades out. */
const BEAM = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
    <defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="${YELLOW}" stop-opacity=".36"/><stop offset=".45" stop-color="${YELLOW}" stop-opacity=".1"/><stop offset=".85" stop-color="${YELLOW}" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 47 1000 0v100L0 53Z" fill="url(#f)"/>
  </svg>`,
)}`;

const MARK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="12.5" fill="none" stroke="${NIGHT}" stroke-opacity=".3" stroke-width="1.6"/>
    <g transform="rotate(-24 16 16)">
      <path d="M16 16 29.5 11.25v9.5Z" fill="${NIGHT}" fill-opacity=".45"/>
      <path d="M16 16 2.5 20.75v-9.5Z" fill="${NIGHT}" fill-opacity=".45"/>
    </g>
    <circle cx="16" cy="16" r="4.6" fill="${NIGHT}"/>
  </svg>`,
)}`;

/** The share card, drawn from the same event data as the page. */
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: NIGHT,
        backgroundImage: `radial-gradient(circle, rgba(255,199,44,0.18) 1.4px, transparent 1.8px)`,
        backgroundSize: "28px 28px",
        backgroundRepeat: "repeat",
        fontFamily: "Bricolage Text",
        color: CREAM,
      }}
    >
      <div style={{ display: "flex", flex: 1, padding: "56px 64px 0", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", fontFamily: "Bricolage Display", fontSize: 150, lineHeight: 0.86, letterSpacing: -8, color: YELLOW }}>
            Beacon
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <div style={{ display: "flex", fontFamily: "Bricolage Display", fontSize: 150, lineHeight: 0.86, letterSpacing: -8 }}>
              Hacks
            </div>
            <div
              style={{
                display: "flex",
                position: "relative",
                width: 26,
                height: 26,
                marginLeft: 6,
                marginBottom: 8,
                borderRadius: 999,
                background: YELLOW,
              }}
            >
              <img src={BEAM} width={560} height={170} style={{ position: "absolute", left: 13, top: -72 }} alt="" />
            </div>
          </div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 30, color: CREAM, maxWidth: 560, lineHeight: 1.3 }}>
            A free hackathon for Bay Area high school builders.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", paddingRight: 14 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              position: "relative",
              width: 400,
              padding: "54px 38px 34px",
              background: CARD,
              color: NIGHT,
              border: `4px solid ${NIGHT}`,
              boxShadow: `14px 14px 0 ${YELLOW}`,
              transform: "rotate(-2deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: -22,
                left: 118,
                padding: "8px 16px",
                background: YELLOW,
                border: `3px solid ${NIGHT}`,
                fontSize: 17,
                letterSpacing: 3,
                transform: "rotate(3deg)",
              }}
            >
              TARGET DATE
            </div>
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: -20,
                right: -20,
                width: 52,
                height: 52,
                alignItems: "center",
                justifyContent: "center",
                background: YELLOW,
                border: `3px solid ${NIGHT}`,
                transform: "rotate(8deg)",
              }}
            >
              <img src={MARK} width={32} height={32} alt="" />
            </div>
            <div style={{ display: "flex", fontFamily: "Bricolage Display", fontSize: 108, lineHeight: 0.84, letterSpacing: -6, whiteSpace: "nowrap" }}>
              Jan 30
            </div>
            <div style={{ display: "flex", marginTop: 8, fontFamily: "Bricolage Display", fontSize: 46, letterSpacing: -2, color: INK_3 }}>
              2027
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 17, letterSpacing: 2, whiteSpace: "nowrap" }}>SATURDAY · BELMONT, CA</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 44,
          padding: "20px 64px",
          background: YELLOW,
          color: NIGHT,
          borderTop: `4px solid ${NIGHT}`,
          fontSize: 24,
        }}
      >
        <div style={{ display: "flex" }}>Grades 9 to 12 · No experience needed · Free</div>
        <div style={{ display: "flex" }}>Early applications open · beaconhacks.com</div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Bricolage Display", data: display, weight: 800, style: "normal" },
        { name: "Bricolage Text", data: text, weight: 700, style: "normal" },
      ],
    },
  );
}
