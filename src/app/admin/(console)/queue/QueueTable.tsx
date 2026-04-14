"use client";

import { useTransition } from "react";
import { RotateCcw } from "lucide-react";
import { retryQueueItem } from "../../actions";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
  sent: { color: "#3DBE8F", bg: "rgba(61,190,143,0.1)" },
  pending: { color: "#E09B3D", bg: "rgba(224,155,61,0.1)" },
  failed: { color: "#E05252", bg: "rgba(224,82,82,0.1)" },
};

interface QueueItem {
  id: string;
  lead_id: string;
  email_number: number;
  band: string;
  scheduled_for: string;
  sent_at: string | null;
  status: string;
  attempts: number;
  last_error: string | null;
  resend_id: string | null;
  leads: { name: string; email: string } | null;
}

export default function QueueTable({ queue }: { queue: QueueItem[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetry = (id: string) => {
    startTransition(async () => {
      await retryQueueItem(id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #1E1A2E" }}>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Lead</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Band</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Email #</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Status</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Scheduled</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Attempts</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {queue.map((item) => {
            const style = STATUS_STYLES[item.status] ?? STATUS_STYLES.pending;
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid #1E1A2E" }} className="hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <div className="font-medium">{item.leads?.name ?? "—"}</div>
                  <div className="text-xs" style={{ color: "#6E6479" }}>{item.leads?.email ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#9A90A8" }}>{item.band}</td>
                <td className="px-4 py-3">#{item.email_number}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: style.color, background: style.bg }}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6E6479" }}>
                  {new Date(item.scheduled_for).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "#6E6479" }}>
                  {item.attempts}
                  {item.last_error && (
                    <div className="mt-0.5 text-[11px] truncate max-w-[200px]" style={{ color: "#E05252" }} title={item.last_error}>
                      {item.last_error}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.status === "failed" && (
                    <button
                      onClick={() => handleRetry(item.id)}
                      disabled={pending}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      title="Retry"
                    >
                      <RotateCcw size={14} style={{ color: "#E09B3D" }} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {queue.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#6E6479" }}>
                Email queue is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
