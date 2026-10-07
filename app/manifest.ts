import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beacon Hacks",
    short_name: "Beacon Hacks",
    description: "A free hackathon for Bay Area high school builders.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f7fa",
    theme_color: "#060d1b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/mark-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
