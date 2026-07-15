// Keycloak OIDC endpoints + grant calls (server-only).
//
// Astro port of the CLEAN CORE of the Next `lib/auth/keycloak.ts` — the issuer /
// URL-join logic only. The next-auth provider and the `@auth/core` `JWT`-typed
// refresh helpers are intentionally NOT ported: they return next-auth-shaped
// token objects, the wrong shape for the cookie session model. Here the grants
// return the raw Keycloak token response and the caller writes cookies.
//
// Env (server-only; this file is never client-bundled). Read runtime-first from
// `process.env`, falling back to `import.meta.env`:
//   - prod (standalone node): the deploy injects every var — incl. the unprefixed
//     secret — into `process.env` at runtime, which is authoritative.
//   - dev (astro dev): Vite loads .env into `import.meta.env` (server-side, all
//     vars) but NOT into `process.env`, so the fallback supplies them.
// (Verified 2026-07-14 — the older `process.env`-only reads were empty in dev.)
import joinURL from "url-join";

const ime = import.meta.env as unknown as Record<string, string | undefined>;
const env = (key: string): string => process.env[key] ?? ime[key] ?? "";

const KEYCLOAK_URL = env("NEXT_PUBLIC_KEYCLOAK_URL");
const REALM = env("NEXT_PUBLIC_KEYCLOAK_REALM");
const CLIENT_SECRET = env("NEXT_KEYCLOAK_CLIENT_SECRET");

const ISSUER = joinURL(KEYCLOAK_URL, "realms", REALM);

export const CLIENT_ID = env("NEXT_PUBLIC_KEYCLOAK_CLIENT_ID");
export const AUTH_URL = joinURL(ISSUER, "/protocol/openid-connect/auth");
export const TOKEN_URL = joinURL(ISSUER, "/protocol/openid-connect/token");
export const LOGOUT_URL = joinURL(ISSUER, "/protocol/openid-connect/logout");

// The subset of the Keycloak token endpoint response we consume. `expires_in` /
// `refresh_expires_in` are seconds.
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

function grantBody(params: Record<string, string>): string {
  return new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    ...params,
  }).toString();
}

async function tokenGrant(
  params: Record<string, string>,
): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: grantBody(params),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Keycloak token grant failed (${res.status}): ${data?.error ?? "unknown"}`,
    );
  }
  return data as TokenResponse;
}

/** Authorization-Code grant — exchange the callback `code` for tokens. */
export function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  return tokenGrant({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
}

/** Refresh-Token grant — mint a fresh token pair from the refresh token. */
export function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  return tokenGrant({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

/**
 * Keycloak back-channel logout — invalidates the refresh token / SSO session.
 * Best-effort: the caller clears local cookies regardless of the outcome.
 */
export async function backchannelLogout(refreshToken: string): Promise<void> {
  await fetch(LOGOUT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: grantBody({ refresh_token: refreshToken }),
  });
}
