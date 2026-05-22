import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker standalone deployment — copies server.js + minimal deps
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
