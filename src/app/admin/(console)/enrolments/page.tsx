import type { Metadata } from "next";
import { getAdminEnrolments } from "@/lib/academy/enrollment-queries";
import EnrolmentsTable from "./EnrolmentsTable";
import RefreshButton from "../RefreshButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Enrolments — Admin" };

function formatPence(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export default async function AdminEnrolmentsPage() {
  const { rows, stats } = await getAdminEnrolments();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-[700]">Enrolments</h1>
        <RefreshButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total enrolments" value={stats.total.toString()} />
        <StatCard
          label="Revenue this month"
          value={formatPence(stats.revenueThisMonthPence)}
        />
        <StatCard label="Active learners" value={stats.activeLearners.toString()} />
      </div>

      <EnrolmentsTable rows={rows} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="p-5 rounded-[10px] shadow-border"
      style={{ background: "var(--surface-0)" }}
    >
      <div
        className="text-[11px] tracking-[0.12em] uppercase mb-1"
        style={{ color: "var(--color-muted)" }}
      >
        {label}
      </div>
      <div className="text-[24px] font-[700]">{value}</div>
    </div>
  );
}
