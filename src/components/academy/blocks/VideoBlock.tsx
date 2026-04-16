import type { Block } from "@/lib/academy/schema";

type VideoB = Extract<Block, { type: "video" }>;

export default function VideoBlock({ block }: { block: VideoB }) {
  const src = `https://player.vimeo.com/video/${encodeURIComponent(
    block.vimeoId
  )}?title=0&byline=0&portrait=0&dnt=1`;
  return (
    <figure className="my-2">
      <div
        className="relative w-full rounded-[12px] overflow-hidden"
        style={{ aspectRatio: "16 / 9", background: "#000" }}
      >
        <iframe
          src={src}
          title={block.title ?? "Lesson video"}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
      {block.title ? (
        <figcaption
          className="text-[13px] mt-2 text-center"
          style={{ color: "var(--color-muted)" }}
        >
          {block.title}
        </figcaption>
      ) : null}
    </figure>
  );
}
