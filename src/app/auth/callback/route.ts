import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Supabase magic-link callback.
 *
 * Supabase sends the user here with either:
 *   - ?code=... (PKCE flow, current default)
 *   - #access_token=... (legacy hash fragment, not handled here)
 *
 * On success we redirect to ?next=/path (sanitized to prevent open-redirect).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchange failed:", error);
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}

/**
 * Allow only same-origin paths starting with "/" and not "//".
 * This blocks ?next=https://evil.com redirects.
 *
 * Backslashes are also blocked: Chromium-based browsers normalize "\" to "/"
 * in URL paths, so "/\evil.com" would resolve to "//evil.com" and become an
 * open redirect. We reject any backslash outright.
 */
function sanitizeNext(raw: string | null): string {
  if (!raw) return "/academy/my-learning";
  if (!raw.startsWith("/")) return "/academy/my-learning";
  if (raw.startsWith("//")) return "/academy/my-learning";
  if (raw.includes("\\")) return "/academy/my-learning";
  return raw;
}
