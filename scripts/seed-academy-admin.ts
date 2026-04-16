/**
 * Grants the "admin" role to a Supabase user identified by email.
 *
 * Usage:
 *   npx tsx scripts/seed-academy-admin.ts denise@sagacitynetwork.net
 *
 * The user must already exist in auth.users. If they don't, sign in once
 * via /login to create the account, then re-run this script.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/seed-academy-admin.ts <email>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Look up user by email via Admin API
  const { data: usersData, error: lookupError } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (lookupError) throw lookupError;

  const user = usersData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    console.error(
      `No auth.users row found for ${email}. Sign in once via /login with this email, then re-run.`
    );
    process.exit(1);
  }

  // Upsert role (primary key on (user_id, role) makes this idempotent)
  const { error: upsertError } = await supabase
    .from("user_roles")
    .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

  if (upsertError) throw upsertError;

  console.log(`✓ ${email} (${user.id}) granted "admin" role.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
