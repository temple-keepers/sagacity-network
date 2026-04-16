import Link from "next/link";
import { Lock, Play, CheckCircle2 } from "lucide-react";
import type { ModuleWithLessons } from "@/lib/academy/queries";

interface Props {
  courseSlug: string;
  courseTitle: string;
  modules: ModuleWithLessons[];
  currentLessonSlug: string;
  completedLessonIds?: Set<string>;
  isEnrolled?: boolean;
  /** When true, lessons link to /learn/<slug> instead of /preview/<slug>. */
  learnMode?: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function LessonSidebar({
  courseSlug,
  courseTitle,
  modules,
  currentLessonSlug,
  completedLessonIds,
  isEnrolled = false,
  learnMode = false,
}: Props) {
  return (
    <aside
      className="lg:sticky lg:top-[88px] lg:max-h-[calc(100vh-108px)] lg:overflow-y-auto rounded-[12px] shadow-border"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="px-5 pt-5 pb-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="text-[10px] tracking-[0.14em] uppercase mb-1"
          style={{ color: "var(--color-muted)" }}
        >
          Course contents
        </div>
        <Link
          href={`/academy/${courseSlug}`}
          className="text-[15px] font-[700] leading-tight transition-colors hover:text-[var(--color-accent)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {courseTitle}
        </Link>
      </div>

      <nav className="py-2">
        {modules.map((m, mi) => {
          const moduleMinutes = m.lessons.reduce((s, l) => s + l.duration_minutes, 0);
          return (
            <div key={m.id} className="py-2">
              <div
                className="px-5 py-2 text-[10px] tracking-[0.12em] uppercase"
                style={{ color: "var(--color-muted)" }}
              >
                Module {mi + 1} · {formatDuration(moduleMinutes)}
              </div>
              <div
                className="px-5 pb-2 text-[13px] font-[600]"
                style={{ color: "var(--color-ink)" }}
              >
                {m.title}
              </div>
              <ul>
                {m.lessons.map((l) => {
                  const isCurrent = l.slug === currentLessonSlug;
                  const isPreview = l.is_free_preview;
                  const isCompleted = completedLessonIds?.has(l.id) ?? false;
                  const unlocked = isEnrolled || isPreview;
                  const canClick = unlocked && !isCurrent;
                  const href = learnMode
                    ? `/academy/${courseSlug}/learn/${l.slug}`
                    : `/academy/${courseSlug}/preview/${l.slug}`;

                  const rowContent = (
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <span className="flex-shrink-0 mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2
                            size={14}
                            style={{ color: "var(--color-accent)" }}
                          />
                        ) : isCurrent ? (
                          <CheckCircle2
                            size={14}
                            style={{ color: "var(--color-accent)", opacity: 0.6 }}
                          />
                        ) : unlocked ? (
                          <Play
                            size={14}
                            style={{ color: "var(--color-accent)" }}
                          />
                        ) : (
                          <Lock
                            size={14}
                            style={{ color: "var(--color-muted)", opacity: 0.5 }}
                          />
                        )}
                      </span>
                      <span
                        className="text-[13px] leading-[1.4] flex-1 min-w-0"
                        style={{
                          color: isCurrent
                            ? "var(--color-accent)"
                            : unlocked
                              ? "var(--color-ink)"
                              : "var(--color-muted)",
                          fontWeight: isCurrent ? 600 : 400,
                        }}
                      >
                        {l.title}
                      </span>
                      <span
                        className="text-[11px] flex-shrink-0"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {formatDuration(l.duration_minutes)}
                      </span>
                    </div>
                  );

                  return (
                    <li key={l.id}>
                      {canClick ? (
                        <Link
                          href={href}
                          className="flex items-center px-5 py-2.5 transition-colors hover:bg-[var(--surface-1)]"
                        >
                          {rowContent}
                        </Link>
                      ) : (
                        <div
                          className="flex items-center px-5 py-2.5"
                          style={{
                            background: isCurrent
                              ? "color-mix(in srgb, var(--color-accent) 8%, transparent)"
                              : "transparent",
                            borderLeft: isCurrent
                              ? "2px solid var(--color-accent)"
                              : "2px solid transparent",
                          }}
                        >
                          {rowContent}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {!isEnrolled ? (
        <div
          className="px-5 py-4 border-t"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--surface-1)",
          }}
        >
          <div className="text-[12px] mb-2" style={{ color: "var(--color-muted)" }}>
            Unlock the full curriculum
          </div>
          <Link
            href={`/academy/${courseSlug}`}
            className="block w-full text-center px-4 py-2 text-[12px] font-[500] rounded-[6px]"
            style={{ background: "var(--gradient-purple)", color: "#fff" }}
          >
            See enrolment options
          </Link>
        </div>
      ) : null}
    </aside>
  );
}
