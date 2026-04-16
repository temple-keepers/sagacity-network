import { getDashboardStats } from "../actions";
import { Users, Mail, MessageSquare, FileText, TrendingUp, BarChart3, CalendarCheck } from "lucide-react";

const BAND_COLORS: Record<string, string> = {
  "Digitally At Risk": "#E05252",
  "Early Stage": "#E09B3D",
  "Developing": "#A668D0",
  "Advanced": "#3DBE8F",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Total Leads", value: stats.totalLeads, sub: `${stats.recentLeads} this week`, icon: Users, color: "#A668D0" },
    { label: "Avg Score", value: stats.avgScore, sub: "out of 100", icon: TrendingUp, color: "#D4B85A" },
    { label: "Upcoming Calls", value: stats.upcomingBookings, sub: `${stats.totalBookings} total`, icon: CalendarCheck, color: "#3DBE8F" },
    { label: "Emails Sent", value: stats.emailsSent, sub: `${stats.emailsPending} pending`, icon: Mail, color: "#3DBE8F" },
    { label: "Failed", value: stats.emailsFailed, sub: "delivery errors", icon: Mail, color: "#E05252" },
    { label: "Contacts", value: stats.totalContacts, sub: "form submissions", icon: MessageSquare, color: "#E09B3D" },
    { label: "Templates", value: stats.templateCount, sub: "email templates", icon: FileText, color: "#6E6479" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>
        Dashboard
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl p-5 border" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
            <div className="flex items-center gap-2 mb-3">
              <c.icon size={16} style={{ color: c.color }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>{c.label}</span>
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{c.value}</div>
            <div className="text-xs mt-1" style={{ color: "#6E6479" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Band distribution */}
      <h2 className="text-sm font-medium uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "#9A90A8" }}>
        <BarChart3 size={14} /> Lead Distribution by Band
      </h2>
      <div className="rounded-xl p-5 border mb-10" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
        {Object.entries(stats.bands).length === 0 ? (
          <p className="text-sm" style={{ color: "#6E6479" }}>No leads yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(stats.bands).map(([band, count]) => {
              const pct = stats.totalLeads ? Math.round((count / stats.totalLeads) * 100) : 0;
              const color = BAND_COLORS[band] ?? "#6E6479";
              return (
                <div key={band}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color }}>{band}</span>
                    <span style={{ color: "#6E6479" }}>{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1E1A2E" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
