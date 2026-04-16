import { getBookings } from "../../actions";
import BookingsTable from "./BookingsTable";
import RefreshButton from "../RefreshButton";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await getBookings();
  // Server component — runs once per request. Date.now() is fine here.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();
  const upcoming = bookings.filter(
    (b) => b.status === "confirmed" && new Date(b.slot_start).getTime() >= nowMs
  ).length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;

  return (
    <>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Bookings
        </h1>
        <div className="flex items-center gap-3 flex-wrap">
          <RefreshButton />
          <span className="text-sm px-3 py-1 rounded-full" style={{ background: "#1E1A2E", color: "#9A90A8" }}>
            {bookings.length} total
          </span>
          <span
            className="text-sm px-3 py-1 rounded-full"
            style={{ background: "rgba(61,190,143,0.12)", color: "#3DBE8F", border: "1px solid rgba(61,190,143,0.3)" }}
          >
            {upcoming} upcoming
          </span>
          {cancelled > 0 && (
            <span
              className="text-sm px-3 py-1 rounded-full"
              style={{ background: "rgba(224,82,82,0.1)", color: "#E05252", border: "1px solid rgba(224,82,82,0.3)" }}
            >
              {cancelled} cancelled
            </span>
          )}
        </div>
      </div>
      <BookingsTable bookings={bookings} />
    </>
  );
}
