import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.43"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/video-thumbnail": [
      "./node_modules/ffmpeg-static/**/*",
    ],
  },
};

export default nextConfig;