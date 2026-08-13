import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { GapSection } from "@/components/home/GapSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Modes } from "@/components/home/Modes";
import { Demo } from "@/components/home/Demo";
import { Founder } from "@/components/home/Founder";
import { BetaSection } from "@/components/home/BetaSection";
import { SITE, SITE_URL } from "@/lib/config";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE.name,
  url: SITE_URL,
  applicationCategory: "CommunicationApplication",
  operatingSystem: "Any",
  description: SITE.description,
  author: {
    "@type": "Person",
    name: SITE.founder.name,
    url: SITE.founder.url,
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free during beta. No account required.",
  },
};

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <GapSection />
        <HowItWorks />
        <Modes />
        <Demo />
        <BetaSection />
        <Founder />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </>
  );
}
