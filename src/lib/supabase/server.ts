import "server-only";
import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components and Route Handlers.
 * Reads session from Next's cookie store; writes are no-ops here
 * (writes happen in middleware.ts and Route Handlers separately).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }));
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      } catch {
        // Called from a Server Component — safe to ignore; middleware will refresh.
      }
    },
  };

  return createServerClient(url, anonKey, { cookies: cookieMethods });
}
