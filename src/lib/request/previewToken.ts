import type { APIContext } from "astro";
import { isDraftModeEnabled } from "./draftMode";

// The access token to fetch an entity's primary query WITH when — and only when
// — draft mode is on, so the API returns draft content + a truthful canPreview
// for the viewer. Off draft mode (the common path) this is undefined and the
// query stays anonymous/cacheable. Anonymous-in-preview also yields undefined.
export function previewToken(context: APIContext): string | undefined {
  return isDraftModeEnabled(context)
    ? context.locals.session?.accessToken
    : undefined;
}
