// TEMPORARY (Astro migration) — auth stub.
//
// The Next implementation of these was a `"use server"` module that statically
// imported next-auth (@/lib/auth/initAuth + @/lib/auth/keycloak). Astro/Vite has
// no `"use server"` handling, so those imports would ship next-auth into the
// browser island bundle. Until the auth phase ports the hcc Keycloak client
// pattern (httpOnly cookies, /api/auth/* routes — see docs/astro-auth-plan.md),
// these are inert placeholders so the global chrome renders and hydrates.
//
// Signatures are unchanged so AccountDropdown / AppFooter / PreviewModeButton
// compile untouched; the buttons are simply no-ops until auth lands.

function notYet(action: string) {
  if (typeof window !== "undefined") {
    console.warn(`[auth stub] ${action} not wired up yet (Astro migration).`);
  }
}

export async function signIn() {
  notYet("signIn");
}

export async function signOut() {
  notYet("signOut");
}

export async function enterPreviewMode() {
  notYet("enterPreviewMode");
}
