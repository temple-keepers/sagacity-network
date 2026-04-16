"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { deleteCalendarEvent } from "@/lib/google-calendar";
import { sendCancellationEmail, type Booking } from "@/lib/emails/booking-emails";

const ADMIN_PW = process.env.ADMIN_PASSWORD ?? "";
const COOKIE = "sagacity_admin";
const TOKEN = "authenticated";

/* ── Auth ── */

export async function login(_prev: unknown, formData: FormData) {
  const pw = formData.get("password") as string;
  if (!ADMIN_PW) return { error: "ADMIN_PASSWORD env var not set." };
  if (pw !== ADMIN_PW) return { error: "Wrong password." };

  const jar = await cookies();
  jar.set(COOKIE, TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(COOKIE);
  redirect("/admin/login");
}

export async function isAuthenticated() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === TOKEN;
}

/* ── Dashboard stats ── */

export async function getDashboardStats() {
  const nowIso = new Date().toISOString();
  const [leads, contacts, queue, templates, bookingsAll, bookingsUpcoming] = await Promise.all([
    getSupabaseAdmin().from("leads").select("id, score, band, created_at", { count: "exact" }),
    getSupabaseAdmin().from("contacts").select("id", { count: "exact" }),
    getSupabaseAdmin().from("email_queue").select("id, status", { count: "exact" }),
    getSupabaseAdmin().from("email_templates").select("band, email_number", { count: "exact" }),
    getSupabaseAdmin().from("bookings").select("id, status", { count: "exact" }),
    getSupabaseAdmin()
      .from("bookings")
      .select("id", { count: "exact" })
      .eq("status", "confirmed")
      .gte("slot_start", nowIso),
  ]);

  const queueData = queue.data ?? [];
  const leadsData = leads.data ?? [];
  const bookingsData = bookingsAll.data ?? [];

  // Band distribution
  const bands: Record<string, number> = {};
  for (const l of leadsData) {
    bands[l.band] = (bands[l.band] ?? 0) + 1;
  }

  // Recent leads (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const recentLeads = leadsData.filter((l) => l.created_at >= weekAgo).length;

  return {
    totalLeads: leads.count ?? 0,
    recentLeads,
    totalContacts: contacts.count ?? 0,
    emailsSent: queueData.filter((e) => e.status === "sent").length,
    emailsPending: queueData.filter((e) => e.status === "pending").length,
    emailsFailed: queueData.filter((e) => e.status === "failed").length,
    templateCount: templates.count ?? 0,
    bands,
    avgScore: leadsData.length ? Math.round(leadsData.reduce((s, l) => s + l.score, 0) / leadsData.length) : 0,
    totalBookings: bookingsAll.count ?? 0,
    upcomingBookings: bookingsUpcoming.count ?? 0,
    confirmedBookings: bookingsData.filter((b) => b.status === "confirmed").length,
    cancelledBookings: bookingsData.filter((b) => b.status === "cancelled").length,
  };
}

/* ── Leads ── */

export async function getLeads() {
  const { data, error } = await getSupabaseAdmin()
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteLead(id: string) {
  // Delete queue entries first (FK)
  await getSupabaseAdmin().from("email_queue").delete().eq("lead_id", id);
  const { error } = await getSupabaseAdmin().from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Email queue ── */

export async function getEmailQueue() {
  const { data, error } = await getSupabaseAdmin()
    .from("email_queue")
    .select("*, leads(name, email)")
    .order("scheduled_for", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function retryQueueItem(id: string) {
  const { error } = await getSupabaseAdmin()
    .from("email_queue")
    .update({ status: "pending", attempts: 0, last_error: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Email templates ── */

export async function getEmailTemplates() {
  const { data, error } = await getSupabaseAdmin()
    .from("email_templates")
    .select("*")
    .order("band")
    .order("email_number");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function updateTemplate(band: string, emailNumber: number, fields: { subject?: string; preview?: string; body?: string }) {
  const { error } = await getSupabaseAdmin()
    .from("email_templates")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("band", band)
    .eq("email_number", emailNumber);
  if (error) throw new Error(error.message);
}

/* ── Contacts ── */

export async function getContacts() {
  const { data, error } = await getSupabaseAdmin()
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function deleteContact(id: string) {
  const { error } = await getSupabaseAdmin().from("contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/* ── Bookings ── */

export interface AdminBooking {
  id: string;
  lead_id: string | null;
  name: string;
  email: string;
  business: string | null;
  message: string | null;
  slot_start: string;
  slot_end: string;
  meeting_link: string | null;
  status: "confirmed" | "cancelled" | "completed";
  score: number | null;
  band: string | null;
  google_event_id: string | null;
  cancel_token: string;
  reminder_24h_sent: boolean | null;
  reminder_1h_sent: boolean | null;
  created_at: string;
  leads?: {
    q1: number | null;
    q2: number | null;
    q3: number | null;
    q4: number | null;
    q5: number | null;
    q6: number | null;
    q7: number | null;
    q8: number | null;
  } | null;
}

export async function getBookings(): Promise<AdminBooking[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("bookings")
    .select("*, leads(q1,q2,q3,q4,q5,q6,q7,q8)")
    .order("slot_start", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminBooking[];
}

export async function cancelBookingAsAdmin(id: string): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: booking, error: fetchErr } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr || !booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed") return; // idempotent

  // Flip status with optimistic lock
  const { error: updateErr } = await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "confirmed");
  if (updateErr) throw new Error(updateErr.message);

  // Delete calendar event (ignore 404/410 in lib)
  if (booking.google_event_id) {
    try {
      await deleteCalendarEvent(booking.google_event_id);
    } catch (err) {
      console.error("[admin/cancelBooking] calendar delete failed:", err);
    }
  }

  // Notify prospect (best effort)
  try {
    await sendCancellationEmail({
      id: booking.id,
      name: booking.name,
      email: booking.email,
      business: booking.business,
      message: booking.message,
      slot_start: booking.slot_start,
      slot_end: booking.slot_end,
      meeting_link: booking.meeting_link ?? "",
      cancel_token: booking.cancel_token,
    } satisfies Booking);
  } catch (err) {
    console.error("[admin/cancelBooking] email failed:", err);
  }
}

export async function deleteBooking(id: string): Promise<void> {
  // For truly erroneous rows. Prefer cancelBookingAsAdmin for normal flow.
  const { error } = await getSupabaseAdmin().from("bookings").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
