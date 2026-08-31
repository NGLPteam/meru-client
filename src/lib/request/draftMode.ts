import type { APIContext } from "astro";
import { COOKIE, COOKIE_OPTIONS } from "~/lib/auth/constants";

// Draft/preview-mode accessors. Astro has no ambient request context, so these
// take the `context`/`Astro` object and read/write an unsigned httpOnly cookie.
// Session-scoped (no maxAge) so it clears on browser close; `exitPreview` /
// `disableDraftMode` clears it sooner.
type CookieHolder = Pick<APIContext, "cookies">;

const ON = "1";

export function isDraftModeEnabled(context: CookieHolder): boolean {
  return context.cookies.get(COOKIE.draftMode)?.value === ON;
}

export function enableDraftMode(context: CookieHolder): void {
  context.cookies.set(COOKIE.draftMode, ON, { ...COOKIE_OPTIONS });
}

export function disableDraftMode(context: CookieHolder): void {
  context.cookies.delete(COOKIE.draftMode, { path: COOKIE_OPTIONS.path });
}
