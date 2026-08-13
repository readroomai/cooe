import { Suspense } from "react";
import type { Metadata } from "next";
import { CheckStudio } from "@/components/studio/CheckStudio";

export const metadata: Metadata = {
  title: "Check",
  description:
    "Paste a message before you send it and see how it may land. No account needed.",
  alternates: { canonical: "/studio/check" },
};

export default function CheckPage() {
  return (
    <Suspense fallback={null}>
      <CheckStudio />
    </Suspense>
  );
}
