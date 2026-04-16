"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { Trash2, ChevronDown, ChevronUp, XCircle, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { cancelBookingAsAdmin, deleteBooking, type AdminBooking } from "../../actions";

const BAND_COLORS: Record<string, string> = {
  "Digitally At Risk": "#E05252",
  "Early Stage": "#E09B3D",
  "Developing": "#A668D0",
  "Advanced": "#3DBE8F",
};

const STATUS_COLORS: Record<string, { fg: string; bg: string }> = {
  confirmed: { fg: "#3DBE8F", bg: "rgba(61,190,143,0.12)" },
  cancelled: { fg: "#E05252", bg: "rgba(224,82,82,0.12)" },
  completed: { fg: "#9A90A8", bg: "rgba(154,144,168,0.12)" },
};

const CATEGORIES = [
  "Web presence",
  "Lead follow-up",
  "Cybersecurity",
  "Automation",
  "BI",
  "Client exp",
  "Reputation",
  "AI readiness",
];

function formatLondon(iso: string): { day: string; time: string } {
  const d = new Date(iso);
  return {
    day: new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Europe/London",
    }).format(d),
    time: new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Europe/London",
    }).format(d),
  };
}

function lowestCategory(b: AdminBooking): { label: string; value: number } | null {
  if (!b.leads) return null;
  const scores = [
    b.leads.q1,
    b.leads.q2,
    b.leads.q3,
    b.leads.q4,
    b.leads.q5,
    b.leads.q6,
    b.leads.q7,
    b.leads.q8,
  ];
  let min = Infinity;
  let minIdx = -1;
  scores.forEach((s, i) => {
    if (typeof s === "number" && s < min) {
      min = s;
      minIdx = i;
    }
  });
  if (minIdx === -1) return null;
  return { label: CATEGORIES[minIdx], value: min };
}

export default function BookingsTable({ bookings }: { bookings: AdminBooking[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  // Snapshot "now" once at mount so `isPast` is stable across re-renders
  // until the next server refresh (router.refresh).
  // eslint-disable-next-line react-hooks/purity
  const mountedAtMs = useMemo(() => Date.now(), []);

  const handleCancel = (b: AdminBooking) => {
    if (b.status !== "confirmed") return;
    const { day, time } = formatLondon(b.slot_start);
    if (
      !confirm(
        `Cancel ${b.name}'s booking on ${day} at ${time}?\n\nThis will:\n- Mark the booking cancelled\n- Remove the event from Google Calendar\n- Email ${b.email} to let them know`
      )
    )
      return;
    startTransition(async () => {
      await cancelBookingAsAdmin(b.id);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (
      !confirm(
        "Permanently delete this booking row?\n\nOnly use this for erroneous rows — normal cancellations should use 'Cancel'."
      )
    )
      return;
    startTransition(async () => {
      await deleteBooking(id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-xl border overflow-x-auto" style={{ background: "#110E1C", borderColor: "#1E1A2E" }}>
      <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr style={{ borderBottom: "1px solid #1E1A2E" }}>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>
              When
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>
              Name
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>
              Business
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>
              Score
            </th>
            <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: "#6E6479" }}>
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const { day, time } = formatLondon(b.slot_start);
            const status = STATUS_COLORS[b.status] ?? STATUS_COLORS.confirmed;
            const lowest = lowestCategory(b);
            const isPast = new Date(b.slot_start).getTime() < mountedAtMs;
            return (
              <Fragment key={b.id}>
                <tr
                  className="cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{ borderBottom: "1px solid #1E1A2E" }}
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium">{day}</div>
                    <div className="text-xs" style={{ color: "#6E6479" }}>
                      {time} UK{isPast && b.status === "confirmed" ? " · past" : ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs" style={{ color: "#9A90A8" }}>{b.email}</div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "#9A90A8" }}>
                    {b.business || <span style={{ color: "#6E6479" }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {b.score != null ? (
                      <div className="flex items-center gap-2">
                        <span>{b.score}</span>
                        {b.band && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              color: BAND_COLORS[b.band] ?? "#9A90A8",
                              border: `1px solid ${BAND_COLORS[b.band] ?? "#1E1A2E"}`,
                              background: `${BAND_COLORS[b.band] ?? "#1E1A2E"}15`,
                            }}
                          >
                            {b.band}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: "#6E6479" }}>cold</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full capitalize"
                      style={{
                        color: status.fg,
                        background: status.bg,
                        border: `1px solid ${status.fg}40`,
                      }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      {expanded === b.id ? (
                        <ChevronUp size={14} style={{ color: "#6E6479" }} />
                      ) : (
                        <ChevronDown size={14} style={{ color: "#6E6479" }} />
                      )}
                      {b.status === "confirmed" && !isPast && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel(b);
                          }}
                          disabled={pending}
                          className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                          title="Cancel booking (notifies prospect)"
                        >
                          <XCircle size={14} style={{ color: "#E09B3D" }} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(b.id);
                        }}
                        disabled={pending}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                        title="Delete row (erroneous data only)"
                      >
                        <Trash2 size={14} style={{ color: "#E05252" }} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expanded === b.id && (
                  <tr key={`${b.id}-detail`} style={{ borderBottom: "1px solid #1E1A2E" }}>
                    <td colSpan={6} className="px-4 py-4" style={{ background: "#0D0B14" }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                        <div>
                          <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#6E6479" }}>
                            Meeting
                          </div>
                          {b.meeting_link && (
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mb-1"
                              style={{ color: "#A668D0" }}
                            >
                              Join link <ExternalLink size={11} />
                            </a>
                          )}
                          <div style={{ color: "#9A90A8" }}>
                            Booked {new Date(b.created_at).toLocaleString("en-GB", { timeZone: "Europe/London" })}
                          </div>
                          {b.google_event_id && (
                            <div style={{ color: "#6E6479" }}>Calendar event: {b.google_event_id.slice(0, 16)}…</div>
                          )}
                          <div className="flex gap-3 mt-2" style={{ color: "#6E6479" }}>
                            <span>24h reminder: {b.reminder_24h_sent ? "sent" : "—"}</span>
                            <span>1h reminder: {b.reminder_1h_sent ? "sent" : "—"}</span>
                          </div>
                        </div>
                        <div>
                          {b.message ? (
                            <>
                              <div className="text-[10px] uppercase tracking-wider mb-2" style={{ color: "#6E6479" }}>
                                Their message
                              </div>
                              <div
                                className="italic p-3 rounded-lg"
                                style={{ background: "#110E1C", color: "#C8BED4", border: "1px solid #1E1A2E" }}
                              >
                                &ldquo;{b.message}&rdquo;
                              </div>
                            </>
                          ) : (
                            <div style={{ color: "#6E6479" }}>No message left.</div>
                          )}
                          {lowest && (
                            <div className="mt-3">
                              <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "#6E6479" }}>
                                Weakest category
                              </div>
                              <div>
                                <span style={{ color: "#E09B3D" }}>{lowest.label}</span>{" "}
                                <span style={{ color: "#6E6479" }}>({lowest.value}/6)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {bookings.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#6E6479" }}>
                No bookings yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
