import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SITE, SITE_URL } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Cooe — See what they hear",
    template: "%s — Cooe",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "communication",
    "conversation rehearsal",
    "message check",
    "difficult conversations",
  ],
  authors: [{ name: SITE.founder.name, url: SITE.founder.url }],
  creator: SITE.founder.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE_URL,
    title: "Cooe — See what they hear",
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Cooe — See what they hear",
    description: SITE.description,
    creator: SITE.founder.handle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#fcfbf9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-paper text-ink">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-5 focus:top-5 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-[13px] focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
