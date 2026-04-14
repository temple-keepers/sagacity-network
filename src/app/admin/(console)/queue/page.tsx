import { getEmailQueue } from "../../actions";
import QueueTable from "./QueueTable";
import RefreshButton from "../RefreshButton";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const queue = await getEmailQueue();

  const sent = queue.filter((q: any) => q.status === "sent").length;
  const pending = queue.filter((q: any) => q.status === "pending").length;
  const failed = queue.filter((q: any) => q.status === "failed").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Email Queue
        </h1>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(61,190,143,0.1)", color: "#3DBE8F" }}>{sent} sent</span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(224,155,61,0.1)", color: "#E09B3D" }}>{pending} pending</span>
          {failed > 0 && <span className="text-xs px-3 py-1 rounded-full" style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}>{failed} failed</span>}
        </div>
      </div>
      <QueueTable queue={queue} />
    </>
  );
}
