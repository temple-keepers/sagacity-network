"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => router.refresh())}
      disabled={pending}
      className="p-2 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw size={14} className={pending ? "animate-spin" : ""} style={{ color: "#9A90A8" }} />
    </button>
  );
}
