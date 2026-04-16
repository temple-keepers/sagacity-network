import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const academyEnabled = isAcademyEnabled();

  let isSignedIn = false;
  if (academyEnabled) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = !!user;
  }

  return (
    <>
      <Nav academyEnabled={academyEnabled} isSignedIn={isSignedIn} />
      <main>{children}</main>
      <Footer />
    </>
  );
}
