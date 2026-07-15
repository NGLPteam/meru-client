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
  site: process.env.NEXT_PUBLIC_FE_URL || undefined,
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
  server: { port: 4321 },
  vite: {
    // Expose the app's public deploy vars to the client bundle via
    // import.meta.env. These carry the legacy NEXT_PUBLIC_ prefix (public by
    // convention, same as Next); secrets without the prefix stay server-only.
    // Client code reads them through lib/env/clientConfig.ts — the single swap
    // point for the eventual var rename / Next removal. GOOGLE_MAPS_KEY is a
    // public browser key (analytics geo chart), exposed by its full name.
    envPrefix: ["PUBLIC_", "NEXT_PUBLIC_", "GOOGLE_MAPS_KEY"],
  },
});
