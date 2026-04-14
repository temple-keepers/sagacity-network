"use client";

import { useState, useTransition } from "react";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteLead } from "../../actions";
import { useRouter } from "next/navigation";

const BAND_COLORS: Record<string, string> = {
  "Digitally At Risk": "#E05252",
  "Early Stage": "#E09B3D",
  "Developing": "#A668D0",
  "Advanced": "#3DBE8F",
};

interface Lead {
  id: string;
  name: string;
  email: string;
  business: string | null;
  score: number;
  band: string;
  q1: number; q2: number; q3: number; q4: number;
  q5: number; q6: number; q7: number; q8: number;
  created_at: string;
  email_sequence_started: boolean;
  utm_source: string | null;
}

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = (id: string) => {
    if (!confirm("Delete this lead and all their queued emails?")) return;
    startTransition(async () => {
      await deleteLead(id);
      router.refresh();
    });
  };

  const categories = ["Web Presence", "Lead Follow-up", "Cybersecurity", "Automation", "Data & Reporting", "Client Experience", "Online Reputation", "AI Readiness"];

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #1E1A2E" }}>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Name</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Email</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Band</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Score</th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>Date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <>
              <tr
                key={lead.id}
                className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid #1E1A2E" }}
                onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
              >
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3" style={{ color: "#9A90A8" }}>{lead.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: BAND_COLORS[lead.band] ?? "#9A90A8", border: `1px solid ${BAND_COLORS[lead.band] ?? "#1E1A2E"}`, background: `${BAND_COLORS[lead.band] ?? "#1E1A2E"}15` }}>
                    {lead.band}
                  </span>
                </td>
                <td className="px-4 py-3">{lead.score}</td>
                <td className="px-4 py-3" style={{ color: "#6E6479" }}>
                  {new Date(lead.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    {expanded === lead.id ? <ChevronUp size={14} style={{ color: "#6E6479" }} /> : <ChevronDown size={14} style={{ color: "#6E6479" }} />}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(lead.id); }}
                      disabled={pending}
                      className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                      title="Delete lead"
                    >
                      <Trash2 size={14} style={{ color: "#E05252" }} />
                    </button>
                  </div>
                </td>
              </tr>
              {expanded === lead.id && (
                <tr key={`${lead.id}-detail`} style={{ borderBottom: "1px solid #1E1A2E" }}>
                  <td colSpan={6} className="px-4 py-4" style={{ background: "#0D0B14" }}>
                    <div className="grid grid-cols-4 gap-3">
                      {[lead.q1, lead.q2, lead.q3, lead.q4, lead.q5, lead.q6, lead.q7, lead.q8].map((q, i) => (
                        <div key={i} className="text-xs">
                          <div style={{ color: "#6E6479" }}>{categories[i]}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1E1A2E" }}>
                              <div className="h-full rounded-full" style={{ width: `${(q / 5) * 100}%`, background: q <= 2 ? "#E05252" : q <= 3 ? "#E09B3D" : "#3DBE8F" }} />
                            </div>
                            <span style={{ color: "#9A90A8" }}>{q}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-3 text-xs" style={{ color: "#6E6479" }}>
                      {lead.business && <span>Business: {lead.business}</span>}
                      {lead.utm_source && <span>Source: {lead.utm_source}</span>}
                      <span>Sequence: {lead.email_sequence_started ? "Started" : "Not started"}</span>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
          {leads.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#6E6479" }}>
                No leads yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
