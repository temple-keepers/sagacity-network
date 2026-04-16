import type { Block } from "@/lib/academy/schema";

type HeadingB = Extract<Block, { type: "heading" }>;

export default function HeadingBlock({ block }: { block: HeadingB }) {
  const Tag = block.level === 2 ? "h2" : "h3";
  const sizeClass =
    block.level === 2
      ? "text-[28px] md:text-[32px] font-[700] tracking-heading"
      : "text-[20px] md:text-[22px] font-[700]";
  return (
    <Tag
      className={`${sizeClass} mt-4`}
      style={{ fontFamily: "var(--font-display)" }}
    >
      {block.text}
    </Tag>
  );
}
