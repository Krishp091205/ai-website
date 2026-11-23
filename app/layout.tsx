import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-tungsten",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://krishp091205.github.io/ai-website"),
  title: {
    default: "GYMVERSE — Train Without Apology",
    template: "%s · GYMVERSE",
  },
  description:
    "GYMVERSE is a 14,000 sq ft strength and conditioning arena in Mumbai. Explore the 3D gym, choose a training mission, and book a coach.",
  keywords: [
    "gym",
    "fitness",
    "personal training",
    "programs",
    "membership",
    "strength",
    "conditioning",
    "Mumbai",
  ],
  authors: [{ name: "GYMVERSE" }],
  openGraph: {
    type: "website",
    siteName: "GYMVERSE",
    title: "GYMVERSE — Train Without Apology",
    description:
      "A 14,000 sq ft strength and conditioning arena in Mumbai. Explore the 3D gym, choose a mission, and book a coach.",
    url: "https://krishp091205.github.io/ai-website",
    images: [
      {
        url: "https://krishp091205.github.io/ai-website/img/about.jpg",
        width: 1400,
        height: 900,
        alt: "GYMVERSE training arena",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GYMVERSE — Train Without Apology",
    description:
      "A 14,000 sq ft strength and conditioning arena in Mumbai. Explore the 3D gym, choose a mission, and book a coach.",
    images: ["https://krishp091205.github.io/ai-website/img/about.jpg"],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: "GYMVERSE",
  url: "https://krishp091205.github.io/ai-website",
  slogan: "Train Without Apology",
  description:
    "A 14,000 sq ft strength and conditioning arena in Mumbai offering five training programs, personal coaching, six facility zones, and membership tiers.",
  email: "grind@gymverse.fit",
  telephone: "+91 98200 00000",
  address: {
    "@type": "PostalAddress",
    streetAddress: "42 Iron Street, Industrial District",
    addressLocality: "Mumbai",
    postalCode: "400001",
    addressCountry: "IN",
  },
  openingHours: ["Mo-Fr 05:00-23:00", "Sa-Su 07:00-22:00"],
  priceRange: "₹₹₹",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {children}
      </body>
    </html>
  );
}