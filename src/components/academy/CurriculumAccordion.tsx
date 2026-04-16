"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Lock, Play } from "lucide-react";
import type { ModuleWithLessons } from "@/lib/academy/queries";

interface Props {
  courseSlug: string;
  modules: ModuleWithLessons[];
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export default function CurriculumAccordion({ courseSlug, modules }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(modules.map((m) => m.id)) // default: all open
  );

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      {modules.map((m) => {
        const open = openIds.has(m.id);
        const moduleMinutes = m.lessons.reduce((s, l) => s + l.duration_minutes, 0);
        return (
          <div
            key={m.id}
            className="rounded-[12px] overflow-hidden shadow-border"
            style={{ background: "var(--surface-0)" }}
          >
            <button
              type="button"
              onClick={() => toggle(m.id)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left"
              aria-expanded={open}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-[16px] md:text-[17px] font-[700] mb-1"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {m.title}
                </div>
                <div className="text-[12px]" style={{ color: "var(--color-muted)" }}>
                  {m.lessons.length} lessons · {formatDuration(moduleMinutes)}
                </div>
              </div>
              <ChevronDown
                size={20}
                className="flex-shrink-0 transition-transform duration-200"
                style={{
                  color: "var(--color-muted)",
                  transform: open ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </button>
            {open ? (
              <ul
                className="border-t divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {m.lessons.map((l) => {
                  const inner = (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {l.is_free_preview ? (
                          <Play size={14} style={{ color: "var(--color-accent)" }} />
                        ) : (
                          <Lock size={14} style={{ color: "var(--color-muted)", opacity: 0.5 }} />
                        )}
                        <span
                          className="text-[14px] truncate"
                          style={{
                            color: l.is_free_preview ? "var(--color-ink)" : "var(--color-muted)",
                          }}
                        >
                          {l.title}
                        </span>
                        {l.is_free_preview ? (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-[4px] font-[600] tracking-[0.04em] uppercase"
                            style={{
                              background: "rgba(201, 168, 76, 0.15)",
                              color: "#C9A84C",
                            }}
                          >
                            Preview
                          </span>
                        ) : null}
                      </div>
                      <span
                        className="text-[12px] flex-shrink-0"
                        style={{ color: "var(--color-muted)" }}
                      >
                        {formatDuration(l.duration_minutes)}
                      </span>
                    </>
                  );

                  return (
                    <li key={l.id}>
                      {l.is_free_preview ? (
                        <Link
                          href={`/academy/${courseSlug}/preview/${l.slug}`}
                          className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--surface-1)] transition-colors"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-4 px-5 py-3">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
