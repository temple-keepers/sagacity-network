import type { Block } from "@/lib/academy/schema";
import HeadingBlock from "./blocks/HeadingBlock";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import VideoBlock from "./blocks/VideoBlock";
import CalloutBlock from "./blocks/CalloutBlock";
import DownloadBlock from "./blocks/DownloadBlock";
import CodeBlock from "./blocks/CodeBlock";
import QuizBlock from "./blocks/QuizBlock";
import DividerBlock from "./blocks/DividerBlock";
import EmbedBlock from "./blocks/EmbedBlock";

interface Props {
  blocks: Block[];
  /** When true, quiz Submit CTAs link to /login instead of grading inline. */
  isPreview?: boolean;
  /** When true, quizzes render in interactive mode. */
  isEnrolled?: boolean;
}

export default function BlockRenderer({
  blocks,
  isPreview = false,
  isEnrolled = false,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {blocks.map((b) => {
        switch (b.type) {
          case "heading":
            return <HeadingBlock key={b.id} block={b} />;
          case "text":
            return <TextBlock key={b.id} block={b} />;
          case "image":
            return <ImageBlock key={b.id} block={b} />;
          case "video":
            return <VideoBlock key={b.id} block={b} />;
          case "callout":
            return <CalloutBlock key={b.id} block={b} />;
          case "download":
            return <DownloadBlock key={b.id} block={b} />;
          case "code":
            return <CodeBlock key={b.id} block={b} />;
          case "quiz":
            return (
              <QuizBlock
                key={b.id}
                block={b}
                isPreview={isPreview}
                interactive={isEnrolled}
              />
            );
          case "divider":
            return <DividerBlock key={b.id} />;
          case "embed":
            return <EmbedBlock key={b.id} block={b} />;
        }
      })}
    </div>
  );
}
