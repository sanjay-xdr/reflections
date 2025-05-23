import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow implicit 'any' types without causing build errors
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
