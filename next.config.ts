import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Previewing over 127.0.0.1 / the LAN address is normal here; without this
  // Next blocks its own dev assets from those origins and nothing hydrates.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.238"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
