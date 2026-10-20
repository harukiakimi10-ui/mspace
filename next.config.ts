import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.58"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
