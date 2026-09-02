"use client";

import { actions } from "astro:actions";

export async function signOut() {
  // Best-effort backchannel logout + cookie clear (server-side). Cookies are
  // cleared regardless of the Keycloak call's outcome, so a hard nav to "/"
  // lands on a freshly-anonymous SSR page.
  await actions.logout();
  if (typeof window !== "undefined") window.location.assign("/");
}

export async function enterPreviewMode() {
  // Global preview toggle: set the draft cookie server-side. The caller
  // (PreviewModeButton) reloads once the transition settles so the next SSR
  // render picks up draft mode; the per-entity canPreview gate governs content.
  await actions.enterPreview();
}
