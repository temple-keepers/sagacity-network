import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sign-out endpoint. POST-only + Origin check to foil CSRF: an attacker's
 * page cannot issue a cross-origin POST and log the user out.
 *
 * On same-origin POST: clears the Supabase session cookie and 303's home.
 */
export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  // Browsers always send Origin on POST. If it's missing or doesn't match
  // the request host, the call is either non-browser or cross-origin — reject.
  if (!origin || !host) {
    return new NextResponse("Forbidden", { status: 403 });
  }
  try {
    if (new URL(origin).host !== host) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  const { origin: reqOrigin } = new URL(request.url);
  return NextResponse.redirect(`${reqOrigin}/`, { status: 303 });
}
