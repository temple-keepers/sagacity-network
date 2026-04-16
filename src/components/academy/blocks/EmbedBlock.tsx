import type { Block } from "@/lib/academy/schema";

type EmbedB = Extract<Block, { type: "embed" }>;

const TRUSTED_HOSTS = new Set([
  "loom.com", "www.loom.com",
  "figma.com", "www.figma.com",
  "codesandbox.io",
]);

function isTrusted(url: string): boolean {
  try {
    const u = new URL(url);
    return TRUSTED_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

export default function EmbedBlock({ block }: { block: EmbedB }) {
  const trusted = block.provider !== "generic-iframe" && isTrusted(block.url);

  if (!trusted) {
    return (
      <a
        href={block.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block p-4 rounded-[12px] shadow-border"
        style={{ background: "var(--surface-0)" }}
      >
        <div className="text-[13px]" style={{ color: "var(--color-muted)" }}>
          Open in new tab:
        </div>
        <div className="text-[14px] font-[500] truncate" style={{ color: "var(--color-accent)" }}>
          {block.url}
        </div>
      </a>
    );
  }

  return (
    <div
      className="relative w-full rounded-[12px] overflow-hidden"
      style={{ aspectRatio: "16 / 9", background: "#000", height: block.height }}
    >
      <iframe
        src={block.url}
        title="Embedded content"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className="absolute inset-0 w-full h-full border-0"
      />
    </div>
  );
}
