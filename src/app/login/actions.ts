"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

type State = { ok?: boolean; error?: string } | null;

export async function requestMagicLink(_prev: State, formData: FormData): Promise<State> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const redirectPath = String(formData.get("redirect") ?? "/academy/my-learning");

  if (!email || !/.+@.+\..+/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const h = await headers();
  const origin = h.get("origin") ?? h.get("x-forwarded-host") ?? "http://localhost:3000";
  const baseUrl = origin.startsWith("http") ? origin : `https://${origin}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("[login] magic link send failed:", error);
    return { error: "Couldn't send the login link. Please try again." };
  }

  return { ok: true };
}
