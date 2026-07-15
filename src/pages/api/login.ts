import type { APIContext } from "astro";
import { COOKIE } from "~/lib/auth/constants";
import { exchangeCode } from "~/lib/auth/keycloak";
import { setSessionCookies, siteOrigin } from "~/lib/auth/session";

// Keycloak Authorization-Code callback. Keycloak redirects the browser here with
// `?code` after login; we exchange it for tokens server-side (with the client
// secret), set the httpOnly cookie pair, and return the user to where they began.
//
// `redirect_uri` must match the one sent in the /auth request exactly, so it is
// derived the same way (siteOrigin + /api/login).
export async function GET(context: APIContext): Promise<Response> {
  const code = context.url.searchParams.get("code");
  if (!code) {
    return context.redirect("/?auth_error=missing_code");
  }

  try {
    const tokens = await exchangeCode(code, `${siteOrigin(context)}/api/login`);
    setSessionCookies(context, tokens);
  } catch {
    return context.redirect("/?auth_error=token_exchange");
  }

  const dest = context.cookies.get(COOKIE.redirectUri)?.value ?? "/";
  context.cookies.delete(COOKIE.redirectUri, { path: "/" });
  // Only same-origin relative paths — never open-redirect to an absolute URL.
  return context.redirect(dest.startsWith("/") ? dest : "/");
}
