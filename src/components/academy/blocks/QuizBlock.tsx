import Link from "next/link";
import type { Block } from "@/lib/academy/schema";

type QuizB = Extract<Block, { type: "quiz" }>;

interface Props {
  block: QuizB;
  isPreview: boolean;
}

export default function QuizBlock({ block, isPreview }: Props) {
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
      <h4 className="text-[18px] font-[700] mb-4" style={{ fontFamily: "var(--font-display)" }}>
        {block.prompt}
      </h4>

      <ol className="flex flex-col gap-5 list-decimal pl-5">
        {block.questions.map((q) => (
          <li key={q.id}>
            <div className="text-[15px] font-[500] mb-2" style={{ color: "var(--color-ink)" }}>
              {q.question}
            </div>
            <ul className="flex flex-col gap-2">
              {q.options.map((o) => (
                <li key={o.id}>
                  <label className="flex items-center gap-2 text-[14px]" style={{ color: "var(--color-muted)" }}>
                    <input
                      type={q.type === "multi-choice" ? "checkbox" : "radio"}
                      name={q.id}
                      disabled
                      className="accent-[var(--color-accent)]"
                    />
                    {o.text}
                  </label>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <div className="mt-6">
        {isPreview ? (
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
