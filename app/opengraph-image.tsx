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
        background: "#0f0e0c",
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
            "radial-gradient(circle, rgba(255,178,40,0.28), rgba(255,178,40,0) 62%)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 9999,
            background: "#ffb228",
            boxShadow: "0 0 24px rgba(255,178,40,0.8)",
          }}
        />
        <div style={{ fontSize: 26, letterSpacing: 6, color: "#c4bfb2" }}>
          BEACON HACKS
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            color: "#f5f2ea",
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
            color: "#ffb228",
            lineHeight: 1.02,
            letterSpacing: -4,
          }}
        >
          lights the way.
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#c4bfb2" }}>
        <div style={{ display: "flex" }}>Target {EVENT.targetDateLabel}</div>
        <div style={{ display: "flex", color: "#8b8577" }}>·</div>
        <div style={{ display: "flex" }}>{EVENT.venue.label}</div>
        <div style={{ display: "flex", color: "#8b8577" }}>·</div>
        <div style={{ display: "flex" }}>Applications not open yet</div>
      </div>
    </div>,
    size,
  );
}
