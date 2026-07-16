// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";

// Astro is now the sole app (the Next app/ + next.config.js were removed in the
// auth migration). Serves from src/pages/, sharing postcss.config.js /
// tailwind.config.js and the @/* + ~/* tsconfig path aliases. output: "server" +
// the node adapter = request-time SSR (the settled rendering model).
export default defineConfig({
  output: "server",
  // Canonical site origin for absolute URLs (sitemap/robots). Empty in dev, so
  // those endpoints fall back to the request origin. No trailing slash needed.
  // NEXT_PUBLIC_FE_URL is the legacy deploy name — drop the fallback once the
  // deploy config is renamed.
  site: process.env.SITE_URL || process.env.NEXT_PUBLIC_FE_URL || undefined,
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  server: { port: 4321 },
  vite: {
    // Expose the app's public deploy vars to the client bundle via
    // import.meta.env — Astro's PUBLIC_ convention; everything else stays
    // server-only. Client code reads them through lib/env/clientConfig.ts —
    // the single client swap point. The legacy NEXT_PUBLIC_/GOOGLE_MAPS_KEY
    // entries keep the old deploy names working during the rename transition —
    // drop them (and clientConfig's fallbacks) once the deploy config is renamed.
    envPrefix: ["PUBLIC_", "NEXT_PUBLIC_", "GOOGLE_MAPS_KEY"],
  },
});
