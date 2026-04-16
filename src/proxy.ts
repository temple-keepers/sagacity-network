import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

/**
 * Root proxy. Two jobs:
 *   1. Refresh the Supabase session cookie on every matched request.
 *   2. Gate every Academy-related route behind the ACADEMY_ENABLED flag.
 *
 * The flag-gated set must cover ANY surface an attacker could reach without
 * first passing /login — so we list the login page, the auth callback, the
 * sign-out API, and the future /academy tree. Anything Slice 2+ adds under
 * /account or similar must be added here.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Feature-flag gate
  if (!isAcademyEnabled()) {
    if (
      pathname.startsWith("/academy") ||
      pathname === "/login" ||
      pathname.startsWith("/auth/") ||
      pathname.startsWith("/api/auth/")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip Next internals + static files, but DO match root + all pages/API
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
