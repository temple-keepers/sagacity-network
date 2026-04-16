import type { Block } from "@/lib/academy/schema";

type CodeB = Extract<Block, { type: "code" }>;

export default function CodeBlock({ block }: { block: CodeB }) {
  return (
    <figure className="my-2">
      <pre
        className="p-4 rounded-[10px] overflow-x-auto text-[13px] leading-[1.6]"
        style={{
          background: "var(--surface-1)",
          color: "var(--color-ink)",
          border: "1px solid var(--color-border)",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        }}
      >
        <code data-language={block.language}>{block.code}</code>
      </pre>
      {block.caption ? (
        <figcaption
          className="text-[13px] mt-2 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {block.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
