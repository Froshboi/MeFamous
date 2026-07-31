import "server-only";
import type { NextRequest } from "next/server";

/**
 * A scheduler (GitHub Actions — see .github/workflows/cron.yml) calls this
 * route directly on schedule — anyone who finds the URL could too, so every
 * cron route must check this before doing any work. Set the same value as
 * the CRON_SECRET repo secret in GitHub and the CRON_SECRET env var on the
 * Railway service; the workflow sends it as `Authorization: Bearer <value>`.
 */
export function isAuthorizedCronRequest(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}
