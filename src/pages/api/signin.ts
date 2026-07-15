import type { APIContext } from "astro";
import { redirectToLogin } from "~/lib/auth/session";

// Sign-in initiator: kicks off the OIDC Authorization-Code flow. The eventual
// AccountDropdown sign-in (step 4) links here (`/api/signin?returnTo=<path>`);
// it also makes the auth foundation independently testable end-to-end.
export function GET(context: APIContext): Response {
  return redirectToLogin(
    context,
    context.url.searchParams.get("returnTo") ?? "/",
  );
}
