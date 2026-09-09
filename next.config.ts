import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Previewing over 127.0.0.1 / the LAN address is normal here; without this
  // Next blocks its own dev assets from those origins and nothing hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost", "[::1]", "192.168.1.238"],
  // A second build directory, so a production build for checking can sit
  // beside a running dev server without touching its .next.
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
