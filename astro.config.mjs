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
});
