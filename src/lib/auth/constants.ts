import type { AstroCookieSetOptions } from "astro";

// Meru-idiomatic cookie names (not hcc's cryptic `_gql-token-*`). The access
// cookie holds the Keycloak **access_token** (Meru's API authorizes with
// `Authorization: Bearer <access_token>`), not an id_token/JWT.
export const COOKIE = {
  accessToken: "meru-access-token",
  refreshToken: "meru-refresh-token",
  redirectUri: "meru-redirect-uri",
} as const;

// Shared cookie options. Unsigned (rely on httpOnly/secure/sameSite). `secure`
// follows the build target so cookies still set over http://localhost in dev.
export const COOKIE_OPTIONS: AstroCookieSetOptions = {
  httpOnly: true,
  secure: import.meta.env.PROD,
  sameSite: "lax",
  path: "/",
};

// Expire the access cookie this many seconds BEFORE the token actually does, so
// a request never lands with a present-but-expired token (clock skew / in-flight
// latency). getSession then sees the cookie gone and refreshes proactively.
export const EXPIRY_SKEW_SECONDS = 30;

// How long the post-login return path is remembered (one OIDC round trip).
export const REDIRECT_URI_MAX_AGE = 600;
