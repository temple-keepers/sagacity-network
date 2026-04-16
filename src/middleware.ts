import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isAcademyEnabled } from "@/lib/academy/feature-flag";

/**
 * Root middleware. Two jobs:
 *   1. Refresh the Supabase session cookie on every matched request.
 *   2. Gate /academy and /login behind the ACADEMY_ENABLED flag.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Feature-flag gate
  if (!isAcademyEnabled()) {
    if (pathname.startsWith("/academy") || pathname === "/login") {
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
