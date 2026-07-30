import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MSpace Admin",
    short_name: "Admin",
    description: "MSpace Administration",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#5b21b6",
    icons: [
      {
        src: "/admin-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/admin-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}