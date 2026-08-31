import { defineMiddleware } from "astro:middleware";
import { getSession } from "~/lib/auth/session";

// Populate `locals` with the current session, refreshing transparently when the
// access cookie has expired but the refresh cookie is still live.
//
// Runs globally — session attach is cheap (cookie reads; a network call only in
// the refresh window), and downstream consumers (the /api/graphql proxy, page
// renders) need the refreshed session on every request.
export const attachUserAndSession = defineMiddleware(async (context, next) => {
  const session = await getSession(context);
  context.locals.session = session ?? undefined;
  context.locals.isAuthenticated = session !== null;
  return next();
});
