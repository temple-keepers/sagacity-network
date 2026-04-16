import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";
import { getMyEnrolledCourses } from "@/lib/academy/enrollment-queries";
import EnrolledCourseCard from "@/components/academy/EnrolledCourseCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Learning — Sagacity Academy",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ welcome?: string }>;
}

export default async function MyLearningPage({ searchParams }: Props) {
  if (!isAcademyEnabled()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/academy/my-learning");
  }

  const sp = await searchParams;
  const showWelcome = sp.welcome === "1";

  const courses = await getMyEnrolledCourses();

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <section
        className="py-12 md:py-16"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-site section-px">
          <h1
            className="text-[32px] md:text-[44px] font-[800] tracking-display mb-2"
            style={{ fontFamily: "var(--font-display)", color: "#F0ECF4" }}
          >
            My Learning
          </h1>
          <p className="text-[15px]" style={{ color: "rgba(240, 236, 244, 0.7)" }}>
            {showWelcome
              ? "Welcome aboard. Pick up where you left off any time."
              : "Pick up where you left off."}
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="max-w-site section-px">
          {courses.length === 0 ? (
            <div className="max-w-[520px] mx-auto text-center py-10">
              <h2
                className="text-[22px] font-[700] mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                You haven&apos;t enrolled in any courses yet
              </h2>
              <p className="text-[14px] mb-6" style={{ color: "var(--color-muted)" }}>
                Browse the catalog and pick something to start learning.
              </p>
              <Link
                href="/academy"
                className="inline-block px-6 py-3 text-[14px] font-[500] rounded-[8px]"
                style={{ background: "var(--gradient-purple)", color: "#fff" }}
              >
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <EnrolledCourseCard key={c.id} course={c} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
