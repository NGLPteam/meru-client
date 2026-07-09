// Draft/preview-mode accessors. Single swap point for the Astro SSR migration:
// draft mode there is a signed cookie read/written via Astro.cookies (or
// Astro.locals), so only this module changes. Application code must go through
// these helpers rather than importing next/headers directly. Server-only.
//
// next/headers is imported dynamically inside each function (never statically)
// because these helpers are reachable from modules that also end up in client
// bundles (e.g. queryApi via GlobalStaticContext) — a static next/headers import
// there is a build error. The dynamic import runs only on the server at call
// time.

export async function isDraftModeEnabled(): Promise<boolean> {
  const { draftMode } = await import("next/headers");
  return (await draftMode()).isEnabled;
}

export async function enableDraftMode(): Promise<void> {
  const { draftMode } = await import("next/headers");
  (await draftMode()).enable();
}

export async function disableDraftMode(): Promise<void> {
  const { draftMode } = await import("next/headers");
  (await draftMode()).disable();
}
