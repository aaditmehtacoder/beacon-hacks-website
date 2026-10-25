import type { NextConfig } from "next";
import { EVENT } from "./lib/event";

const nextConfig: NextConfig = {
  // Previewing over 127.0.0.1 / the LAN address is normal here; without this
  // Next blocks its own dev assets from those origins and nothing hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost", "[::1]", "192.168.1.238"],
  // A second build directory, so a production build for checking can sit
  // beside a running dev server without touching its .next.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // /apply was the application form; links to it still land on the
  // registration page, which is on Luma now.
  async redirects() {
    return [{ source: "/apply", destination: EVENT.applications.url, permanent: false }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    /* 85 for the judges' portraits, which are faces at small sizes;
       everything else uses the default 75. */
    qualities: [75, 85],
  },
};

export default nextConfig;
