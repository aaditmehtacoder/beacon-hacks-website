import { ImageResponse } from "next/og";
import { EVENT } from "@/lib/event";

export const alt = `Beacon Hacks. ${EVENT.tagline} Targeting ${EVENT.targetDateLabel}, Belmont CA.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The share card, generated from the same event data as the page. */
export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#faf8f4",
        padding: "72px 80px",
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -260,
          right: -160,
          width: 700,
          height: 700,
          borderRadius: 9999,
          background:
            "radial-gradient(circle, rgba(242,161,0,0.30), rgba(242,161,0,0) 62%)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: "#f2a100",
          }}
        />
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#46433b" }}>
          BEACON HACKS
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#16150f",
            lineHeight: 1.02,
            letterSpacing: -4,
          }}
        >
          Build what
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#a35c00",
            lineHeight: 1.02,
            letterSpacing: -4,
          }}
        >
          lights the way.
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#46433b" }}>
        <div style={{ display: "flex" }}>Target {EVENT.targetDateLabel}</div>
        <div style={{ display: "flex", color: "#97917f" }}>·</div>
        <div style={{ display: "flex" }}>{EVENT.venue.label}</div>
        <div style={{ display: "flex", color: "#97917f" }}>·</div>
        <div style={{ display: "flex" }}>Applications not open yet</div>
      </div>
    </div>,
    size,
  );
}
