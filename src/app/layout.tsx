import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sagacity Network Ltd — Digital Product Studio | UK",
  description:
    "Enterprise-grade digital products for growing businesses. Web apps, Power BI dashboards, AI automation, cybersecurity, and training. Founded by a capital programme manager and cybersecurity specialist.",
  metadataBase: new URL("https://sagacitynetwork.net"),
  openGraph: {
    title: "Sagacity Network Ltd — Digital Product Studio | UK",
    description:
      "Enterprise-grade digital products for growing businesses. Web apps, Power BI dashboards, AI automation, cybersecurity, and training.",
    url: "https://sagacitynetwork.net",
    siteName: "Sagacity Network Ltd",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@sagacitynetwork",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} dark`}
      suppressHydrationWarning
    >
      <body className="font-body">
        <ThemeProvider>
          <Nav />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
