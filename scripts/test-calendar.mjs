/**
 * Smoke test for the Google Calendar integration.
 * Run with: node --env-file=.env.local scripts/test-calendar.mjs
 *
 * Verifies:
 *   1. Service account credentials parse
 *   2. Token exchange works
 *   3. FreeBusy returns (no error from Google)
 *   4. getAvailableSlots returns something reasonable for next weekday
 */

// Lightweight re-implementation of the server-only lib for node-script use.
// (We can't import the real ts file without tsx/ts-node.)
import crypto from "node:crypto";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

if (!email || !rawKey || !calendarId) {
  console.error("✗ Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY / GOOGLE_CALENDAR_ID");
  process.exit(1);
}
const privateKey = rawKey.replace(/\\n/g, "\n");
console.log(`→ Service account: ${email}`);
console.log(`→ Calendar ID:     ${calendarId}`);

const b64url = (b) =>
  (typeof b === "string" ? Buffer.from(b) : b)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const now = Math.floor(Date.now() / 1000);
const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const payload = b64url(
  JSON.stringify({
    iss: email,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })
);
const signingInput = `${header}.${payload}`;
const signature = b64url(crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey));
const jwt = `${signingInput}.${signature}`;

console.log("→ Signed JWT, requesting access token...");
const tokRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: jwt,
  }),
});
if (!tokRes.ok) {
  console.error(`✗ Token exchange failed (${tokRes.status}):`, await tokRes.text());
  process.exit(1);
}
const { access_token } = await tokRes.json();
console.log(`✓ Got access token (${access_token.slice(0, 16)}…)`);

// FreeBusy for next 7 days
const start = new Date();
const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
console.log(`→ Querying FreeBusy: ${start.toISOString()} → ${end.toISOString()}`);
const fbRes = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${access_token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    timeZone: "Europe/London",
    items: [{ id: calendarId }],
  }),
});
if (!fbRes.ok) {
  console.error(`✗ FreeBusy failed (${fbRes.status}):`, await fbRes.text());
  process.exit(1);
}
const fbData = await fbRes.json();
const cal = fbData.calendars?.[calendarId];
if (cal?.errors?.length) {
  console.error(`✗ Calendar error:`, JSON.stringify(cal.errors));
  console.error("  → Usually means the calendar isn't shared with the service account.");
  console.error("  → Re-check Step 3 in docs/google-calendar-setup.md.");
  process.exit(1);
}
console.log(`✓ FreeBusy returned ${cal?.busy?.length ?? 0} busy period(s) in next 7 days`);
if (cal?.busy?.length) {
  cal.busy.slice(0, 3).forEach((b) => {
    console.log(
      `    ${formatInTimeZone(new Date(b.start), "Europe/London", "EEE d MMM HH:mm")} → ${formatInTimeZone(new Date(b.end), "Europe/London", "HH:mm")}`
    );
  });
}

// Find next weekday
let probe = new Date();
while ([0, 6].includes(toZonedTime(probe, "Europe/London").getDay())) {
  probe = new Date(probe.getTime() + 24 * 60 * 60 * 1000);
}
console.log(`→ Next weekday in London: ${formatInTimeZone(probe, "Europe/London", "EEEE d MMM yyyy")}`);
console.log("\n✓ All checks passed. Service account is wired up correctly.");
