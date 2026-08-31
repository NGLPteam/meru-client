"use client";

import { actions } from "astro:actions";

function currentReturnTo(): string {
  if (typeof window === "undefined") return "/";
  return window.location.pathname + window.location.search;
}

export async function signIn() {
  if (typeof window === "undefined") return;
  window.location.assign(
    `/api/signin?returnTo=${encodeURIComponent(currentReturnTo())}`,
  );
}

export async function signOut() {
  // Best-effort backchannel logout + cookie clear (server-side). Cookies are
  // cleared regardless of the Keycloak call's outcome, so a hard nav to "/"
  // lands on freshly-anonymous SSR chrome.
  await actions.logout();
  if (typeof window !== "undefined") window.location.assign("/");
}

export async function enterPreviewMode() {
  // Global preview toggle: set the draft cookie server-side. The caller
  // (PreviewModeButton) reloads once the transition settles so the next SSR
  // render picks up draft mode; the per-entity canPreview gate governs content.
  await actions.enterPreview();
}
