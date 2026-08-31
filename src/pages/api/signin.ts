import type { APIContext } from "astro";
import { redirectToLogin } from "~/lib/auth/session";

// Kicks off the OIDC Authorization-Code flow (`/api/signin?returnTo=<path>`).
export function GET(context: APIContext): Response {
  return redirectToLogin(
    context,
    context.url.searchParams.get("returnTo") ?? "/",
  );
}
