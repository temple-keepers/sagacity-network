import Link from "next/link";
import type { CourseSummary } from "@/lib/academy/queries";

const LEVEL_PILL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

function formatPrice(cents: number): string {
  if (cents === 0) return "Free";
  return `\u00a3${(cents / 100).toFixed(0)}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link
      href={`/academy/${course.slug}`}
      className="group block card-hover shadow-border overflow-hidden"
      style={{ borderRadius: "var(--radius-md)", background: "var(--surface-0)" }}
    >
      <div
        className="h-[160px] relative overflow-hidden"
        style={{
          background: course.hero_image_url
            ? `center/cover no-repeat url(${course.hero_image_url})`
            : "var(--gradient-purple)",
        }}
      >
        <div
          className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-[500] tracking-[0.04em] rounded-[6px]"
          style={{ background: "rgba(0, 0, 0, 0.55)", color: "#fff" }}
        >
          {LEVEL_PILL[course.level] ?? course.level}
        </div>
      </div>

      <div className="p-5">
        <h3
          className="text-[18px] font-[700] mb-1 transition-colors duration-300 group-hover:text-[var(--color-accent)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {course.title}
        </h3>
        <p className="text-[13px] leading-[1.55] mb-4" style={{ color: "var(--color-muted)" }}>
          {course.subtitle}
        </p>
        <div
          className="flex items-center justify-between text-[12px]"
          style={{ color: "var(--color-muted)" }}
        >
          <span>
            {course.module_count} modules · {formatDuration(course.duration_minutes)}
          </span>
          <span className="font-[600]" style={{ color: "var(--color-ink)" }}>
            {formatPrice(course.price_cents)}
          </span>
        </div>
      </div>
    </Link>
  );
}
