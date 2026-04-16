"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Check, Clock, Loader2 } from "lucide-react";

type Step = "date" | "slot" | "form" | "confirmed";

interface ConfirmedBooking {
  bookingId: string;
  slotStart: string;
  slotEnd: string;
  meetingLink: string;
  name: string;
  email: string;
}

const TIMEZONE_LABEL = "All times shown in UK time (GMT/BST)";

export default function BookPage() {
  return (
    <Suspense fallback={<PageShell><div className="text-center py-20 text-[var(--color-muted)]">Loading…</div></PageShell>}>
      <BookFlow />
    </Suspense>
  );
}

function BookFlow() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const [step, setStep] = useState<Step>("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Date[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [business, setBusiness] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<ConfirmedBooking | null>(null);

  // ── Fetch slots when date changes ────────────────────────────────────────
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = formatIsoDate(selectedDate);
    setLoadingSlots(true);
    setSlotsError(null);
    fetch(`/api/booking/slots?date=${dateStr}`)
      .then((r) => r.json().then((j) => ({ ok: r.ok, json: j })))
      .then(({ ok, json }) => {
        if (!ok) {
          setSlotsError(json.error ?? "Failed to load availability");
          setSlots([]);
        } else {
          setSlots((json.slots as string[]).map((s) => new Date(s)));
        }
      })
      .catch((err) => {
        console.error(err);
        setSlotsError("Failed to load availability");
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  const handleSubmit = useCallback(async () => {
    if (!selectedSlot) return;
    if (name.trim().length < 2) {
      setSubmitError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Please enter a valid email.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/booking/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          business: business.trim() || undefined,
          message: message.trim() || undefined,
          slotStart: selectedSlot.toISOString(),
          leadId: leadId ?? undefined,
        }),
      });
      const json = await res.json();

      if (res.status === 409) {
        setSubmitError("This slot was just taken. Please go back and choose another time.");
        return;
      }
      if (!res.ok) {
        setSubmitError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setConfirmed({
        bookingId: json.bookingId,
        slotStart: json.slotStart,
        slotEnd: json.slotEnd,
        meetingLink: json.meetingLink,
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      setStep("confirmed");
    } catch (err) {
      console.error(err);
      setSubmitError("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [name, email, business, message, selectedSlot, leadId]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <PageShell>
      {step === "date" && (
        <DateStep
          selectedDate={selectedDate}
          onSelect={(d) => {
            setSelectedDate(d);
            setStep("slot");
          }}
        />
      )}

      {step === "slot" && selectedDate && (
        <SlotStep
          date={selectedDate}
          slots={slots}
          loading={loadingSlots}
          error={slotsError}
          onBack={() => {
            setSelectedDate(null);
            setStep("date");
          }}
          onSelect={(s) => {
            setSelectedSlot(s);
            setStep("form");
          }}
        />
      )}

      {step === "form" && selectedSlot && (
        <FormStep
          slot={selectedSlot}
          name={name} setName={setName}
          email={email} setEmail={setEmail}
          business={business} setBusiness={setBusiness}
          message={message} setMessage={setMessage}
          submitting={submitting}
          error={submitError}
          hasLead={Boolean(leadId)}
          onBack={() => setStep("slot")}
          onSubmit={handleSubmit}
        />
      )}

      {step === "confirmed" && confirmed && <ConfirmedStep booking={confirmed} />}
    </PageShell>
  );
}

// ── Page shell ─────────────────────────────────────────────────────────────

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <section className="max-w-site section-px pt-[140px] pb-24 min-h-[80vh]">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-10 text-center">
          <div className="inline-block px-3 py-1 text-[11px] font-[500] tracking-[0.18em] uppercase mb-4 rounded-full"
               style={{ background: "color-mix(in srgb, var(--color-purple) 10%, transparent)", color: "var(--color-purple)" }}>
            Digital Clarity Call
          </div>
          <h1 className="text-[clamp(32px,5vw,48px)] font-[700] leading-[1.08] tracking-[-0.02em] mb-3"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
            Book a 30-minute call with Denise
          </h1>
          <p className="text-[15px] leading-[1.55] max-w-[460px] mx-auto" style={{ color: "var(--color-muted)" }}>
            No pitch, no pressure. You do most of the talking. You leave with a clear sense of what to focus on next.
          </p>
        </div>
        {children}
      </div>
    </section>
  );
}

// ── Step 1: Date picker ────────────────────────────────────────────────────

function DateStep({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (d: Date) => void }) {
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return d;
  }, []);

  const monthName = viewMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const days = useMemo(() => {
    // Render a grid starting from Monday of the first week
    const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);
    const startOffset = (first.getDay() + 6) % 7; // Mon=0..Sun=6
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) {
      cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
    }
    return cells;
  }, [viewMonth]);

  const canPrev = viewMonth > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1) <= maxDate;

  return (
    <div className="rounded-3xl p-6 md:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => canPrev && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
          disabled={!canPrev}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
          style={{ background: "color-mix(in srgb, var(--color-purple) 8%, transparent)" }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="font-[600] text-[17px]" style={{ color: "var(--color-ink)" }}>{monthName}</div>
        <button
          onClick={() => canNext && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
          disabled={!canNext}
          aria-label="Next month"
          className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
          style={{ background: "color-mix(in srgb, var(--color-purple) 8%, transparent)" }}
        >
          <ArrowLeft size={16} className="rotate-180" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-[500] uppercase tracking-[0.1em] mb-2" style={{ color: "var(--color-muted)" }}>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const isToday = d.getTime() === today.getTime();
          const isPast = d < today;
          const isTooFar = d > maxDate;
          const isWeekend = d.getDay() === 0 || d.getDay() === 6;
          const disabled = isPast || isTooFar || isWeekend;
          const isSelected = selectedDate && d.getTime() === selectedDate.getTime();
          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => onSelect(d)}
              className="aspect-square rounded-lg text-[14px] font-[500] transition relative"
              style={{
                background: isSelected
                  ? "var(--gradient-purple)"
                  : disabled
                  ? "transparent"
                  : "color-mix(in srgb, var(--color-purple) 6%, transparent)",
                color: isSelected ? "#fff" : disabled ? "var(--color-muted)" : "var(--color-ink)",
                opacity: disabled ? 0.3 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                outline: isToday && !isSelected ? "1.5px solid var(--color-purple)" : "none",
              }}
              aria-label={d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[12px]" style={{ color: "var(--color-muted)" }}>
        Weekdays only • {TIMEZONE_LABEL}
      </p>
    </div>
  );
}

// ── Step 2: Slot picker ────────────────────────────────────────────────────

function SlotStep({
  date, slots, loading, error, onBack, onSelect,
}: {
  date: Date;
  slots: Date[];
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onSelect: (s: Date) => void;
}) {
  const dayLabel = date.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="rounded-3xl p-6 md:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] mb-6 hover:opacity-70 transition" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft size={14} /> Change date
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Calendar size={20} style={{ color: "var(--color-purple)" }} />
        <div>
          <div className="font-[600] text-[17px]" style={{ color: "var(--color-ink)" }}>{dayLabel}</div>
          <div className="text-[12px]" style={{ color: "var(--color-muted)" }}>{TIMEZONE_LABEL}</div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-12 justify-center text-[14px]" style={{ color: "var(--color-muted)" }}>
          <Loader2 size={16} className="animate-spin" /> Loading available times…
        </div>
      )}

      {error && !loading && (
        <p className="py-12 text-center text-[14px]" style={{ color: "#b00" }}>{error}</p>
      )}

      {!loading && !error && slots.length === 0 && (
        <p className="py-12 text-center text-[14px]" style={{ color: "var(--color-muted)" }}>
          No availability on this day. Please try another date.
        </p>
      )}

      {!loading && slots.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.toISOString()}
              onClick={() => onSelect(slot)}
              className="py-3 px-3 rounded-xl text-[14px] font-[500] transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                background: "color-mix(in srgb, var(--color-purple) 6%, transparent)",
                color: "var(--color-ink)",
                border: "1px solid color-mix(in srgb, var(--color-purple) 20%, transparent)",
              }}
            >
              {formatSlotTime(slot)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 3: Form ───────────────────────────────────────────────────────────

function FormStep({
  slot, name, setName, email, setEmail, business, setBusiness, message, setMessage,
  submitting, error, hasLead, onBack, onSubmit,
}: {
  slot: Date;
  name: string; setName: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  business: string; setBusiness: (v: string) => void;
  message: string; setMessage: (v: string) => void;
  submitting: boolean;
  error: string | null;
  hasLead: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-3xl p-6 md:p-8" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] mb-6 hover:opacity-70 transition" style={{ color: "var(--color-muted)" }}>
        <ArrowLeft size={14} /> Change time
      </button>

      <div className="mb-7 p-4 rounded-2xl" style={{ background: "color-mix(in srgb, var(--color-purple) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--color-purple) 15%, transparent)" }}>
        <div className="flex items-center gap-2 text-[12px] font-[500] mb-1" style={{ color: "var(--color-purple)" }}>
          <Clock size={14} /> 30-MIN DIGITAL CLARITY CALL
        </div>
        <div className="font-[600] text-[17px]" style={{ color: "var(--color-ink)" }}>
          {slot.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · {formatSlotTime(slot)} UK
        </div>
      </div>

      <div className="space-y-5">
        <Field label="Your name" required>
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            required autoComplete="name"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition"
            style={{ background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-border)" }}
          />
        </Field>

        <Field label="Email address" required>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition"
            style={{ background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-border)" }}
          />
        </Field>

        <Field label="Business name (optional)">
          <input
            value={business} onChange={(e) => setBusiness(e.target.value)}
            autoComplete="organization"
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition"
            style={{ background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-border)" }}
          />
        </Field>

        <Field label="What do you most want to get out of this call?" sublabel="Optional, max 300 chars">
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value.slice(0, 300))}
            rows={4} maxLength={300}
            className="w-full px-4 py-3 rounded-xl text-[15px] outline-none transition resize-none"
            style={{ background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-border)" }}
          />
          <div className="text-right text-[11px] mt-1" style={{ color: "var(--color-muted)" }}>{message.length}/300</div>
        </Field>

        {hasLead && (
          <p className="text-[12px]" style={{ color: "var(--color-muted)" }}>
            ✓ Your assessment results will be attached to this booking — Denise will see your score and priorities before the call.
          </p>
        )}

        {error && <p className="text-[14px]" style={{ color: "#b00" }}>{error}</p>}

        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full py-4 rounded-xl text-[15px] font-[500] transition disabled:opacity-60"
          style={{ background: "var(--gradient-purple)", color: "#fff" }}
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Booking…
            </span>
          ) : (
            "Confirm my booking →"
          )}
        </button>
      </div>
    </div>
  );
}

function Field({ label, sublabel, required, children }: { label: string; sublabel?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-[13px] font-[500]" style={{ color: "var(--color-ink)" }}>
          {label}{required && <span style={{ color: "var(--color-purple)" }}> *</span>}
        </span>
        {sublabel && <span className="text-[11px]" style={{ color: "var(--color-muted)" }}>{sublabel}</span>}
      </div>
      {children}
    </label>
  );
}

// ── Step 4: Confirmed ──────────────────────────────────────────────────────

function ConfirmedStep({ booking }: { booking: ConfirmedBooking }) {
  const start = new Date(booking.slotStart);
  const end = new Date(booking.slotEnd);

  const googleCalUrl = buildGoogleCalendarUrl({
    title: "Digital Clarity Call — Sagacity Network",
    description: `Your 30-minute call with Denise.\n\nJoin: ${booking.meetingLink}`,
    location: booking.meetingLink,
    start, end,
  });

  return (
    <div className="rounded-3xl p-8 md:p-10 text-center" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: "var(--gradient-purple)" }}>
        <Check size={32} color="#fff" />
      </div>

      <h2 className="text-[28px] font-[700] mb-2 tracking-[-0.02em]" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
        You&rsquo;re booked in.
      </h2>

      <div className="my-7 py-5 px-5 rounded-2xl inline-block text-left" style={{ background: "color-mix(in srgb, var(--color-purple) 6%, transparent)" }}>
        <div className="text-[13px] font-[500] mb-1" style={{ color: "var(--color-purple)" }}>
          {start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div className="text-[22px] font-[600] mb-3" style={{ color: "var(--color-ink)" }}>
          {formatSlotTime(start)} UK time · 30 min
        </div>
        <a href={booking.meetingLink} target="_blank" rel="noreferrer"
           className="inline-flex items-center gap-2 text-[13px] font-[500] hover:opacity-70"
           style={{ color: "var(--color-purple)" }}>
          Join the call →
        </a>
      </div>

      <p className="text-[14px] mb-7" style={{ color: "var(--color-muted)" }}>
        Check your email — a confirmation is on its way to <strong style={{ color: "var(--color-ink)" }}>{booking.email}</strong>, with a calendar invite attached.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <a href={googleCalUrl} target="_blank" rel="noreferrer"
           className="px-5 py-2.5 text-[13px] font-[500] rounded-lg transition hover:-translate-y-0.5"
           style={{ background: "color-mix(in srgb, var(--color-purple) 10%, transparent)", color: "var(--color-ink)", border: "1px solid color-mix(in srgb, var(--color-purple) 25%, transparent)" }}>
          Add to Google Calendar
        </a>
        <Link href="/"
              className="px-5 py-2.5 text-[13px] font-[500] rounded-lg transition hover:opacity-70"
              style={{ color: "var(--color-muted)" }}>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatIsoDate(d: Date): string {
  // Local yyyy-mm-dd — we want the user's picked date in their local calendar
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatSlotTime(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function buildGoogleCalendarUrl({
  title, description, location, start, end,
}: {
  title: string; description: string; location: string; start: Date; end: Date;
}): string {
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location,
    dates: `${fmt(start)}/${fmt(end)}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
