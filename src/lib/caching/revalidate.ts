import serverEnv from "@/lib/env/serverEnv";
import type { APIContext } from "astro";

// Shared plumbing for the /api/revalidate/{entity,instance} webhooks. Keeps the
// original Next contract so the backend integration is unchanged: DELETE method,
// `Authorization: Bearer <REVALIDATE_SECRET>`, JSON body. See the two route files
// and docs/astro-caching-plan.md.

export function getRevalidateSecret(): string | undefined {
  return serverEnv("REVALIDATE_SECRET");
}

function bearerToken(context: APIContext): string | null {
  const authorization = context.request.headers.get("Authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
}

export type Guard = { ok: true } | { ok: false; response: Response };

// Validates config + auth once for both endpoints. 500 if the secret isn't
// configured (misconfigured client), 403 on a missing/wrong bearer token.
export function guardRevalidate(context: APIContext): Guard {
  const secret = getRevalidateSecret();
  if (!secret) {
    return {
      ok: false,
      response: Response.json(
        {
          revalidated: false,
          message:
            "Cannot complete request. Client is missing REVALIDATE_SECRET variable.",
        },
        { status: 500 },
      ),
    };
  }

  if (bearerToken(context) !== secret) {
    return {
      ok: false,
      response: Response.json(
        {
          revalidated: false,
          message: "Unauthorized: missing or invalid revalidate token.",
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true };
}

// Both endpoints require an active cache; without a provider `context.cache` is
// disabled and `invalidate` is a no-op we should surface rather than 200 falsely.
export function cacheDisabledResponse(context: APIContext): Response | null {
  if (context.cache.enabled) return null;
  return Response.json(
    { revalidated: false, message: "Astro cache not enabled." },
    { status: 500 },
  );
}
