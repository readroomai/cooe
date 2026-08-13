import type { Metadata } from "next";
import { MapStudio } from "@/components/studio/MapStudio";

export const metadata: Metadata = {
  title: "Map",
  description:
    "Untangle a disagreement: what each side may be protecting, and what is actually being negotiated.",
  alternates: { canonical: "/studio/map" },
};

export default function MapPage() {
  return <MapStudio />;
}
