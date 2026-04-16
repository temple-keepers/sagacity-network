"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, X } from "lucide-react";
import type { Block } from "@/lib/academy/schema";

type QuizB = Extract<Block, { type: "quiz" }>;

interface Props {
  block: QuizB;
  isPreview: boolean;
  interactive?: boolean;
}

export default function QuizBlock({ block, isPreview, interactive = false }: Props) {
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [revealed, setRevealed] = useState(false);

  function toggle(questionId: string, optionId: string, isMulti: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      const current = new Set(next[questionId] ?? []);
      if (isMulti) {
        if (current.has(optionId)) current.delete(optionId);
        else current.add(optionId);
      } else {
        current.clear();
        current.add(optionId);
      }
      next[questionId] = current;
      return next;
    });
  }

  function reset() {
    setSelected({});
    setRevealed(false);
  }

  function isOptionCorrect(questionId: string, optionId: string): boolean {
    const q = block.questions.find((x) => x.id === questionId);
    return q ? q.correctIds.includes(optionId) : false;
  }

  function isOptionSelected(questionId: string, optionId: string): boolean {
    return selected[questionId]?.has(optionId) ?? false;
  }

  return (
    <div
      className="p-6 rounded-[14px]"
      style={{
        background: "var(--surface-0)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="text-[12px] font-[600] tracking-[0.12em] uppercase mb-2"
        style={{ color: "var(--color-accent)" }}
      >
        Quiz
      </div>
      <h4
        className="text-[18px] font-[700] mb-4"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {block.prompt}
      </h4>

      <ol className="flex flex-col gap-5 list-decimal pl-5">
        {block.questions.map((q) => {
          const isMulti = q.type === "multi-choice";
          return (
            <li key={q.id}>
              <div
                className="text-[15px] font-[500] mb-2"
                style={{ color: "var(--color-ink)" }}
              >
                {q.question}
              </div>
              <ul className="flex flex-col gap-2">
                {q.options.map((o) => {
                  const chosen = isOptionSelected(q.id, o.id);
                  const correct = isOptionCorrect(q.id, o.id);
                  const showMark = interactive && revealed && (chosen || correct);
                  return (
                    <li key={o.id}>
                      <label
                        className="flex items-center gap-2 text-[14px]"
                        style={{
                          color:
                            interactive && revealed && correct
                              ? "var(--color-accent)"
                              : interactive && revealed && chosen && !correct
                                ? "#d4443a"
                                : "var(--color-muted)",
                        }}
                      >
                        <input
                          type={isMulti ? "checkbox" : "radio"}
                          name={q.id}
                          disabled={!interactive || revealed}
                          checked={chosen}
                          onChange={() =>
                            interactive && !revealed && toggle(q.id, o.id, isMulti)
                          }
                          className="accent-[var(--color-accent)]"
                        />
                        <span>{o.text}</span>
                        {showMark ? (
                          correct ? (
                            <Check size={14} style={{ color: "var(--color-accent)" }} />
                          ) : chosen ? (
                            <X size={14} style={{ color: "#d4443a" }} />
                          ) : null
                        ) : null}
                      </label>
                    </li>
                  );
                })}
              </ul>
              {interactive && revealed && q.explanation ? (
                <div
                  className="mt-2 text-[13px]"
                  style={{ color: "var(--color-muted)" }}
                >
                  {q.explanation}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 flex items-center gap-3">
        {interactive ? (
          revealed ? (
            <button
              type="button"
              onClick={reset}
              className="inline-block px-5 py-2.5 text-[13px] font-[500] rounded-[8px]"
              style={{
                background: "transparent",
                color: "var(--color-ink)",
                border: "1px solid var(--color-border)",
              }}
            >
              Reset
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="inline-block px-5 py-2.5 text-[13px] font-[500] rounded-[8px]"
              style={{ background: "var(--gradient-purple)", color: "#fff" }}
            >
              Check answers
            </button>
          )
        ) : isPreview ? (
          <Link
            href="/login?redirect=/academy"
            className="inline-block px-5 py-2.5 text-[13px] font-[500] rounded-[8px]"
            style={{ background: "var(--gradient-purple)", color: "#fff" }}
          >
            Sign in to take the quiz
          </Link>
        ) : (
          <span className="text-[13px]" style={{ color: "var(--color-muted)" }}>
            Enrol to take this quiz and track your progress.
          </span>
        )}
      </div>
    </div>
  );
}
