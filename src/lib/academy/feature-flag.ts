/**
 * Academy feature flag.
 *
 * Set `ACADEMY_ENABLED=true` in env to expose /academy and /login routes.
 * When false (default), /academy/* returns 404 and /login redirects to /.
 *
 * This exists so unreleased Academy code can merge to main without leaking
 * to production users.
 */
export function isAcademyEnabled(): boolean {
  return process.env.ACADEMY_ENABLED === "true";
}
