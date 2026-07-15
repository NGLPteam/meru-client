import type { APIContext } from "astro";
import {
  COOKIE,
  COOKIE_OPTIONS,
  EXPIRY_SKEW_SECONDS,
  REDIRECT_URI_MAX_AGE,
} from "./constants";
import {
  AUTH_URL,
  CLIENT_ID,
  refreshTokens,
  type TokenResponse,
} from "./keycloak";

export interface Session {
  accessToken: string;
  refreshToken: string;
}

// The grant/cookie helpers only need `cookies`; actions and middleware both
// satisfy this without pulling the full APIContext.
type CookieHolder = Pick<APIContext, "cookies">;

/**
 * Persist a Keycloak token pair into the httpOnly cookies. The access cookie
 * self-expires a hair before the token (EXPIRY_SKEW_SECONDS); the refresh cookie
 * tracks `refresh_expires_in`. Once the access cookie drops, getSession refreshes.
 */
export function setSessionCookies(
  context: CookieHolder,
  tokens: TokenResponse,
): void {
  context.cookies.set(COOKIE.accessToken, tokens.access_token, {
    ...COOKIE_OPTIONS,
    maxAge: Math.max(0, tokens.expires_in - EXPIRY_SKEW_SECONDS),
  });
  context.cookies.set(COOKIE.refreshToken, tokens.refresh_token, {
    ...COOKIE_OPTIONS,
    maxAge: tokens.refresh_expires_in,
  });
}

export function clearSessionCookies(context: CookieHolder): void {
  context.cookies.delete(COOKIE.accessToken, { path: COOKIE_OPTIONS.path });
  context.cookies.delete(COOKIE.refreshToken, { path: COOKIE_OPTIONS.path });
}

/**
 * Resolve the current session, transparently refreshing when the access cookie
 * has expired (dropped) but the refresh cookie is still live. Returns null when
 * anonymous, or when a refresh fails (cookies are cleared on failure).
 *
 * Cheap on the common paths: pure cookie reads for anonymous and still-valid
 * sessions; a network call only in the refresh window.
 */
export async function getSession(
  context: CookieHolder,
): Promise<Session | null> {
  const accessToken = context.cookies.get(COOKIE.accessToken)?.value;
  const refreshToken = context.cookies.get(COOKIE.refreshToken)?.value;

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  if (!accessToken && refreshToken) {
    try {
      const tokens = await refreshTokens(refreshToken);
      setSessionCookies(context, tokens);
      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
      };
    } catch {
      clearSessionCookies(context);
      return null;
    }
  }

  return null;
}

/** Canonical site origin (astro.config `site`, else the request origin). */
export function siteOrigin(context: APIContext): string {
  return (context.site?.href ?? context.url.origin).replace(/\/$/, "");
}

/**
 * Start the OIDC Authorization-Code flow: remember where to return, then 302 to
 * Keycloak's `/auth`. `returnTo` defaults to the current path; anything not a
 * same-origin relative path is coerced to "/".
 */
export function redirectToLogin(
  context: APIContext,
  returnTo?: string,
): Response {
  const dest = returnTo ?? context.url.pathname + context.url.search;
  context.cookies.set(COOKIE.redirectUri, dest.startsWith("/") ? dest : "/", {
    ...COOKIE_OPTIONS,
    maxAge: REDIRECT_URI_MAX_AGE,
  });
  const params = new URLSearchParams({
    response_type: "code",
    scope: "openid",
    client_id: CLIENT_ID,
    redirect_uri: `${siteOrigin(context)}/api/login`,
  });
  return context.redirect(`${AUTH_URL}?${params.toString()}`);
}
