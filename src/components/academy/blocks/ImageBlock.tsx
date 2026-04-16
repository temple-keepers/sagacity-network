/* eslint-disable @next/next/no-img-element */
import type { Block } from "@/lib/academy/schema";

type ImageB = Extract<Block, { type: "image" }>;

export default function ImageBlock({ block }: { block: ImageB }) {
  return (
    <figure className="my-2">
      <img
        src={block.url}
        alt={block.alt}
        width={block.width}
        height={block.height}
        className="w-full rounded-[12px]"
        loading="lazy"
      />
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
