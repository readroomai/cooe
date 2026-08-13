import type { Metadata } from "next";
import { RehearseStudio } from "@/components/studio/RehearseStudio";

export const metadata: Metadata = {
  title: "Rehearse",
  description:
    "Practice a difficult conversation against a plausible counterpart, then get a debrief.",
  alternates: { canonical: "/studio/rehearse" },
};

export default function RehearsePage() {
  return <RehearseStudio />;
}
