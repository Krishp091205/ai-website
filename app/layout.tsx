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
    default: "GYMVERSE — Enter the Grind",
    template: "%s · GYMVERSE",
  },
  description:
    "GYMVERSE is a cinematic 3D gym experience. Explore the arena, choose your training mission, and start the grind.",
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
    title: "GYMVERSE — Enter the Grind",
    description:
      "A cinematic 3D gym experience. Explore the arena, choose your training mission, and start the grind.",
    url: "https://krishp091205.github.io/ai-website",
  },
  twitter: {
    card: "summary",
    title: "GYMVERSE — Enter the Grind",
    description:
      "A cinematic 3D gym experience. Explore the arena, choose your training mission, and start the grind.",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "HealthClub",
  name: "GYMVERSE",
  url: "https://krishp091205.github.io/ai-website",
  slogan: "Enter the Grind",
  description:
    "A 14,000 sq ft strength and conditioning arena offering training programs, personal coaching, and luxury membership.",
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