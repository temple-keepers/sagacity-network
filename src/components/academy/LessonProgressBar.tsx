interface Props {
  completed: number;
  total: number;
}

export default function LessonProgressBar({ completed, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div>
      <div
        className="flex items-center justify-between text-[12px] mb-1.5"
        style={{ color: "var(--color-muted)" }}
      >
        <span>
          {completed} of {total} lessons complete
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-border)" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "var(--gradient-purple)",
          }}
        />
      </div>
    </div>
  );
}
