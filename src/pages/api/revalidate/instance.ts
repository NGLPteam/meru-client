import { GLOBAL_TAG } from "@/lib/caching/constants";
import {
  cacheDisabledResponse,
  guardRevalidate,
} from "@/lib/caching/revalidate";
import type { APIContext } from "astro";

// Instance-wide revalidation webhook (Astro port of app/api/revalidate/instance).
// Same contract as the Next endpoint — DELETE + Bearer, no body. The Next version
// did `revalidatePath("/", "layout")` to purge everything; here we purge every
// page carrying the GLOBAL_TAG (installation-wide data: theme / nav / site
// metadata). See docs/astro-caching-plan.md.
//
// ⚠️ The webhook caller MUST send `Content-Type: application/json` (an empty body
// is fine). Astro's CSRF origin check (security.checkOrigin, on by default) 403s
// cross-origin non-safe requests that have NO content-type; a non-form
// content-type exempts them. The entity webhook already sends JSON; the deploy
// must confirm the instance (purge-all) call does too. See core/app/origin-check.
export async function DELETE(context: APIContext): Promise<Response> {
  const guard = guardRevalidate(context);
  if (!guard.ok) return guard.response;

  const disabled = cacheDisabledResponse(context);
  if (disabled) return disabled;

  await context.cache.invalidate({ tags: [GLOBAL_TAG] });

  return Response.json({ revalidated: true, tags: [GLOBAL_TAG] });
}
