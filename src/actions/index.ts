import { defineAction } from "astro:actions";
import { COOKIE } from "~/lib/auth/constants";
import { backchannelLogout, refreshTokens } from "~/lib/auth/keycloak";
import { clearSessionCookies, setSessionCookies } from "~/lib/auth/session";
import { enableDraftMode, disableDraftMode } from "~/lib/request/draftMode";

// Client-invocable auth actions. The grant + cookie logic lives in
// src/lib/auth so server code (getSession/middleware) calls it directly; these
// are the wrappers UI reaches for (e.g. AccountDropdown → logout, step 4).
export const server = {
  // Keycloak back-channel logout + clear local cookies. The backchannel call is
  // best-effort — cookies are cleared regardless so the user is logged out here.
  logout: defineAction({
    handler: async (_input, context) => {
      const refreshToken = context.cookies.get(COOKIE.refreshToken)?.value;
      if (refreshToken) {
        try {
          await backchannelLogout(refreshToken);
        } catch {
          // ignore — local logout still proceeds
        }
      }
      clearSessionCookies(context);
      return { ok: true };
    },
  }),

  // Explicit refresh. getSession refreshes lazily on its own, so this is mainly
  // an escape hatch / for tests; returns ok:false and clears cookies on failure.
  refresh: defineAction({
    handler: async (_input, context) => {
      const refreshToken = context.cookies.get(COOKIE.refreshToken)?.value;
      if (!refreshToken) return { ok: false };
      try {
        const tokens = await refreshTokens(refreshToken);
        setSessionCookies(context, tokens);
        return { ok: true };
      } catch {
        clearSessionCookies(context);
        return { ok: false };
      }
    },
  }),

  // Global preview toggle (account dropdown). enterPreview only sets the draft
  // cookie — the per-entity `canPreview` gate still governs what actually
  // renders, so this is safe to expose to any authed viewer. exitPreview clears
  // it (the draft banner's "exit"). Callers reload afterward to re-render SSR.
  enterPreview: defineAction({
    handler: (_input, context) => {
      enableDraftMode(context);
      return { ok: true };
    },
  }),

  exitPreview: defineAction({
    handler: (_input, context) => {
      disableDraftMode(context);
      return { ok: true };
    },
  }),
};
