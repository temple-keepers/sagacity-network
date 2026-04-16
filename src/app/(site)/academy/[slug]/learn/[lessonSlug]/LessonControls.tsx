"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";

interface Props {
  lessonId: string;
  alreadyCompleted: boolean;
  prevHref: string | null;
  nextHref: string | null;
}

export default function LessonControls({
  lessonId,
  alreadyCompleted,
  prevHref,
  nextHref,
}: Props) {
  const router = useRouter();
  const [done, setDone] = useState(alreadyCompleted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markComplete() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Could not save progress");
        setPending(false);
        return;
      }
      setDone(true);
      setPending(false);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setPending(false);
    }
  }

  return (
    <div
      className="mt-10 pt-8 border-t"
      style={{ borderColor: "var(--color-border)" }}
    >
      {done ? (
        <div
          className="flex items-center gap-2 mb-6 text-[14px] font-[500]"
          style={{ color: "var(--color-accent)" }}
        >
          <CheckCircle2 size={18} />
          Lesson complete
        </div>
      ) : (
        <button
          type="button"
          onClick={markComplete}
          disabled={pending}
          className="mb-6 px-5 py-2.5 text-[14px] font-[500] rounded-[8px] transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--gradient-purple)", color: "#fff" }}
        >
          {pending ? "Saving…" : "Mark as complete"}
        </button>
      )}

      {error ? (
        <p className="text-[12px] mb-4" style={{ color: "#d4443a" }}>
          {error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        {prevHref ? (
          <Link
            href={prevHref}
            className="flex items-center gap-2 text-[13px]"
            style={{ color: "var(--color-muted)" }}
          >
            <ArrowLeft size={14} />
            Previous lesson
          </Link>
        ) : <span />}
        {nextHref ? (
          <Link
            href={nextHref}
            className="flex items-center gap-2 text-[13px] font-[500]"
            style={{ color: "var(--color-ink)" }}
          >
            Next lesson
            <ArrowRight size={14} />
          </Link>
        ) : <span />}
      </div>
    </div>
  );
}
