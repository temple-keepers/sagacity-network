import { Download } from "lucide-react";
import type { Block } from "@/lib/academy/schema";

type DownloadB = Extract<Block, { type: "download" }>;

export default function DownloadBlock({ block }: { block: DownloadB }) {
  return (
    <a
      href={block.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 rounded-[12px] shadow-border card-hover no-underline"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="w-10 h-10 flex items-center justify-center flex-shrink-0 rounded-[8px]"
        style={{ background: "rgba(123, 63, 160, 0.1)", color: "var(--color-accent)" }}
      >
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-[500] truncate" style={{ color: "var(--color-ink)" }}>
          {block.label}
        </div>
        {block.fileSize || block.fileType ? (
          <div className="text-[12px]" style={{ color: "var(--color-muted)" }}>
            {[block.fileType, block.fileSize].filter(Boolean).join(" \u00b7 ")}
          </div>
        ) : null}
      </div>
    </a>
  );
}
