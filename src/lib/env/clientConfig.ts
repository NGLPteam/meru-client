// Client runtime config — the single place the browser bundle reads deploy-time
// public env. Components import named values from here instead of touching
// import.meta.env / process.env directly, so the eventual var rename (and Next
// removal) is a one-file change.
//
// Vite statically inlines these at build; the vars must be listed in
// astro.config's `envPrefix` to be exposed to the client. On the Astro server
// import.meta.env carries every var, so these resolve during island SSR too.
const env = import.meta.env as unknown as Record<string, string | undefined>;

// The NEXT_PUBLIC_/unprefixed fallbacks are the legacy deploy names — drop them
// (and the matching envPrefix entries in astro.config) once the deploy config
// is renamed.

/** Admin app base URL (admin nav, submissions). */
export const ADMIN_URL = env.PUBLIC_ADMIN_URL ?? env.NEXT_PUBLIC_ADMIN_URL;

/** Google Maps API key for the analytics geo chart (public browser key; optional). */
export const GOOGLE_MAPS_KEY = env.PUBLIC_GOOGLE_MAPS_KEY ?? env.GOOGLE_MAPS_KEY;
