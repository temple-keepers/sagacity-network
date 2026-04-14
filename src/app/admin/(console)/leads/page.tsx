import { getLeads } from "../../actions";
import LeadsTable from "./LeadsTable";
import RefreshButton from "../RefreshButton";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Leads
        </h1>
        <div className="flex items-center gap-3">
          <RefreshButton />
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#1E1A2E", color: "#9A90A8" }}>
            {leads.length} total
          </span>
        </div>
      </div>
      <LeadsTable leads={leads} />
    </>
  );
}
