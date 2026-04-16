import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Info, AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import type { Block } from "@/lib/academy/schema";

type CalloutB = Extract<Block, { type: "callout" }>;

const PALETTE = {
  info:    { icon: Info,           border: "rgba(123, 63, 160, 0.25)", bg: "rgba(123, 63, 160, 0.06)",  tint: "#A668D0" },
  warning: { icon: AlertTriangle,  border: "rgba(220, 160, 60, 0.3)",  bg: "rgba(220, 160, 60, 0.08)",  tint: "#DCA03C" },
  success: { icon: CheckCircle2,   border: "rgba(80, 180, 120, 0.3)",  bg: "rgba(80, 180, 120, 0.08)",  tint: "#50B478" },
  tip:     { icon: Lightbulb,      border: "rgba(201, 168, 76, 0.3)",  bg: "rgba(201, 168, 76, 0.08)",  tint: "#C9A84C" },
} as const;

export default function CalloutBlock({ block }: { block: CalloutB }) {
  const p = PALETTE[block.variant];
  const Icon = p.icon;
  return (
    <div
      className="flex gap-3 p-5 rounded-[12px]"
      style={{ background: p.bg, border: `1px solid ${p.border}` }}
    >
      <Icon size={20} style={{ color: p.tint, flexShrink: 0, marginTop: 2 }} />
      <div className="flex-1">
        {block.title ? (
          <div
            className="text-[14px] font-[600] mb-1"
            style={{ color: p.tint }}
          >
            {block.title}
          </div>
        ) : null}
        <div
          className="prose-academy text-[15px] leading-[1.7]"
          style={{ color: "var(--color-ink)" }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
