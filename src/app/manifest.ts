import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cooe — See what they hear",
    short_name: "Cooe",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf9",
    theme_color: "#fcfbf9",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
