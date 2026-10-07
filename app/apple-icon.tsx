import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* The mark in yellow on the night, as in app/icon.svg. iOS rounds the
   corners itself, so the tile is square. */
const MARK = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="10.25" fill="none" stroke="#ffc72c" stroke-opacity=".35" stroke-width="1.5"/>
    <g transform="rotate(-24 16 16)">
      <path d="M16 16 28.5 11.6v8.8Z" fill="#ffc72c" fill-opacity=".55"/>
      <path d="M16 16 3.5 20.4v-8.8Z" fill="#ffc72c" fill-opacity=".55"/>
    </g>
    <circle cx="16" cy="16" r="4.6" fill="#ffc72c"/>
  </svg>`,
)}`;

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#060d1b",
      }}
    >
      <img src={MARK} width={150} height={150} alt="" />
    </div>,
    size,
  );
}
