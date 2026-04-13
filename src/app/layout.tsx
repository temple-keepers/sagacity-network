import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ThemeScript from "@/components/ui/ThemeScript";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sagacity Network — UK Digital Product Studio",
  description:
    "Web & app development, data intelligence, business automation, and cybersecurity. Built by practitioners.",
  metadataBase: new URL("https://sagacitynetwork.net"),
  openGraph: {
    title: "Sagacity Network — UK Digital Product Studio",
    description:
      "Web apps, data systems, automation, and security. Built by practitioners.",
    url: "https://sagacitynetwork.net",
    siteName: "Sagacity Network",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Sagacity Network",
  legalName: "Sagacity Network Ltd",
  url: "https://sagacitynetwork.net",
  description:
    "UK-registered digital product studio. Web development, data intelligence, automation, cybersecurity, and training.",
  foundingDate: "2023",
  address: {
    "@type": "PostalAddress",
    addressCountry: "GB",
  },
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "denise@sagacitynetwork.net",
    contactType: "customer service",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${dmSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
