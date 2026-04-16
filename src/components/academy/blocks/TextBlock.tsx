import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Block } from "@/lib/academy/schema";

type TextB = Extract<Block, { type: "text" }>;

export default function TextBlock({ block }: { block: TextB }) {
  return (
    <div
      className="prose-academy text-[16px] leading-[1.8]"
      style={{ color: "var(--color-ink)" }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.markdown}</ReactMarkdown>
    </div>
  );
}
