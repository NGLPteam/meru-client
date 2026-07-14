// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";

// Phase 0 scaffold (docs/astro-execution-plan.md). Astro coexists with the Next
// app (app/, next.config.js) until the Phase 6 cutover: it serves from src/pages/
// on its own port and shares postcss.config.js / tailwind.config.js and the
// @/* tsconfig path aliases. output: "server" + the node adapter = request-time
// SSR (the settled rendering model).
export default defineConfig({
  output: "server",
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
