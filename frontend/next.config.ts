import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "standalone" — Vercel handles its own output format
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
    ],
  },
  // Silence noisy build warnings from Clerk in edge runtime
  serverExternalPackages: [],
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts"],
  },
};

export default nextConfig;
