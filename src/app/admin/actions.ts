"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const ADMIN_PW = process.env.ADMIN_PASSWORD ?? "";
const COOKIE = "sagacity_admin";
const TOKEN = "authenticated";

/* ── Auth ── */

export async function login(_prev: any, formData: FormData) {
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
  const [leads, contacts, queue, templates] = await Promise.all([
    getSupabaseAdmin().from("leads").select("id, score, band, created_at", { count: "exact" }),
    getSupabaseAdmin().from("contacts").select("id", { count: "exact" }),
    getSupabaseAdmin().from("email_queue").select("id, status", { count: "exact" }),
    getSupabaseAdmin().from("email_templates").select("band, email_number", { count: "exact" }),
  ]);

  const queueData = queue.data ?? [];
  const leadsData = leads.data ?? [];

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
