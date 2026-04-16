"use client";

import { useState, useMemo } from "react";
import type { AdminEnrolmentRow } from "@/lib/academy/enrollment-queries";

export default function EnrolmentsTable({ rows }: { rows: AdminEnrolmentRow[] }) {
  const [course, setCourse] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "active" | "refunded">("all");
  const [dateRange, setDateRange] = useState<"month" | "30d" | "all">("all");

  const courses = useMemo(
    () =>
      Array.from(
        new Map(rows.map((r) => [r.course_id, r.course_title])).entries()
      ),
    [rows]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return rows.filter((r) => {
      if (course !== "all" && r.course_id !== course) return false;
      if (status !== "all" && r.status !== status) return false;
      const rowTime = new Date(r.enrolled_at).getTime();
      if (dateRange === "month") {
        const d = new Date();
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        if (rowTime < monthStart) return false;
      } else if (dateRange === "30d") {
        if (now - rowTime > 30 * 24 * 3600 * 1000) return false;
      }
      return true;
    });
  }, [rows, course, status, dateRange]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="px-3 py-2 rounded-[8px] border"
          style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
        >
          <option value="all">All courses</option>
          {courses.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className="px-3 py-2 rounded-[8px] border"
          style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="refunded">Refunded</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
          className="px-3 py-2 rounded-[8px] border"
          style={{ borderColor: "var(--color-border)", background: "var(--surface-0)" }}
        >
          <option value="all">All time</option>
          <option value="month">This month</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <div
        className="overflow-x-auto rounded-[10px] shadow-border"
        style={{ background: "var(--surface-0)" }}
      >
        <table className="min-w-[900px] w-full text-[13px]">
          <thead>
            <tr className="text-left" style={{ color: "var(--color-muted)" }}>
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Enrolled</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Progress</th>
              <th className="px-4 py-3">Stripe</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-t"
                style={{ borderColor: "var(--color-border)" }}
              >
                <td className="px-4 py-3">
                  <div>{r.learner_name ?? r.learner_email}</div>
                  <div className="text-[11px]" style={{ color: "var(--color-muted)" }}>
                    {r.learner_email}
                  </div>
                </td>
                <td className="px-4 py-3">{r.course_title}</td>
                <td className="px-4 py-3">
                  {new Date(r.enrolled_at).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-3">
                  £{(r.amount_paid_cents / 100).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded-[4px] text-[11px] font-[600] uppercase tracking-[0.04em]"
                    style={{
                      background:
                        r.status === "active"
                          ? "rgba(66, 160, 80, 0.15)"
                          : "rgba(200,200,200,0.15)",
                      color:
                        r.status === "active" ? "#42a050" : "var(--color-muted)",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.completed_lessons} of {r.total_lessons}
                </td>
                <td className="px-4 py-3">
                  {r.stripe_session_id ? (
                    <a
                      href={`https://dashboard.stripe.com/payments?search=${encodeURIComponent(r.stripe_session_id)}`}
                      target="_blank"
                      rel="noopener"
                      className="text-[12px] underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div
          className="text-center py-10 text-[13px]"
          style={{ color: "var(--color-muted)" }}
        >
          No enrolments match these filters.
        </div>
      ) : null}
    </div>
  );
}
