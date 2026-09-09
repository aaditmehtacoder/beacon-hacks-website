import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beacon Hacks",
    short_name: "Beacon",
    description: "A free one day hackathon for Bay Area high schoolers.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0e0c",
    theme_color: "#0f0e0c",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/brand/beacon-mark.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
