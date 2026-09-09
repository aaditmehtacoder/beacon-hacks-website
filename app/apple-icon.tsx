import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** The lamp on a dark tile, for home screens and Safari bookmarks. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f0e0c",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 9999,
          border: "3px solid rgba(255,178,40,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 9999,
            background: "#ffb228",
            boxShadow: "0 0 36px rgba(255,178,40,0.85)",
          }}
        />
      </div>
    </div>,
    size,
  );
}
