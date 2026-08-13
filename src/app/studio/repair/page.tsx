import type { Metadata } from "next";
import { RepairStudio } from "@/components/studio/RepairStudio";

export const metadata: Metadata = {
  title: "Repair",
  description:
    "The conversation went badly. Build a repair attempt that owns what is yours without re-opening the argument.",
  alternates: { canonical: "/studio/repair" },
};

export default function RepairPage() {
  return <RepairStudio />;
}
