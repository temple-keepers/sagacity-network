import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const academyEnabled = isAcademyEnabled();
  return (
    <>
      <Nav academyEnabled={academyEnabled} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
