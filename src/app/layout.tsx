import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "800"],
  variable: "--font-display",
  display: "swap",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
