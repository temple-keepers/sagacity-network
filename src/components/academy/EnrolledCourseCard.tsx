import Link from "next/link";
import type { EnrolledCourse } from "@/lib/academy/enrollment-queries";

export default function EnrolledCourseCard({ course }: { course: EnrolledCourse }) {
  const pct =
    course.total_lessons === 0
      ? 0
      : Math.round((course.completed_lessons / course.total_lessons) * 100);

  const continueHref = course.next_lesson_slug
    ? `/academy/${course.slug}/learn/${course.next_lesson_slug}`
    : `/academy/${course.slug}`;

  return (
    <div
      className="rounded-[12px] overflow-hidden shadow-border"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="h-[160px]"
        style={{
          background: course.hero_image_url
            ? `center/cover no-repeat url(${course.hero_image_url})`
            : "var(--gradient-purple)",
        }}
      />
      <div className="p-5">
        <h3
          className="text-[18px] font-[700] mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
        <p
          className="text-[13px] leading-[1.5] mb-4"
          style={{ color: "var(--color-muted)" }}
        >
          {course.subtitle}
        </p>

        <div
          className="flex items-center justify-between text-[12px] mb-1.5"
          style={{ color: "var(--color-muted)" }}
        >
          <span>
            {course.completed_lessons} of {course.total_lessons} lessons
          </span>
          <span>{pct}%</span>
        </div>
        <div
          className="w-full h-1.5 rounded-full overflow-hidden mb-5"
          style={{ background: "var(--color-border)" }}
        >
          <div
            className="h-full"
            style={{ width: `${pct}%`, background: "var(--gradient-purple)" }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={continueHref}
            className="flex-1 text-center px-4 py-2.5 text-[13px] font-[500] rounded-[8px]"
            style={{ background: "var(--gradient-purple)", color: "#fff" }}
          >
            {pct === 0 ? "Start" : pct === 100 ? "Review" : "Continue"}
          </Link>
          <Link
            href={`/academy/${course.slug}`}
            className="text-[12px]"
            style={{ color: "var(--color-muted)" }}
          >
            View curriculum
          </Link>
        </div>
      </div>
    </div>
  );
}
