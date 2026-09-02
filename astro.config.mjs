// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";

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
  // Server-side response cache (docs/astro-caching-plan.md). memoryCache is
  // per-instance/in-memory — lost on redeploy, and an invalidation webhook only
  // purges the instance it hits (each tenant runs a single long-lived instance).
  // The draft-aware wrapper bypasses the cache for draft-mode requests; per-route
  // opt-in via Astro.cache.set lives in the pages. Only active in `output:server`
  // production builds — dev gets a NoopAstroCache (Astro.cache.enabled === false).
  cache: {
    provider: {
      name: "draft-aware-memory",
      entrypoint: "./src/lib/caching/draftAwareProvider.ts",
    },
  },
  vite: {
    // Expose the app's public deploy vars to the client bundle via
    // import.meta.env — Astro's PUBLIC_ convention; everything else stays
    // server-only. Client code reads them through lib/env/clientConfig.ts —
    // the single client swap point. The legacy NEXT_PUBLIC_/GOOGLE_MAPS_KEY
    // entries keep the old deploy names working during the rename transition —
    // drop them (and clientConfig's fallbacks) once the deploy config is renamed.
    envPrefix: ["PUBLIC_", "NEXT_PUBLIC_", "GOOGLE_MAPS_KEY"],
    // Bundle the reakit family into the SSR build. reakit ships bare directory
    // imports (`reakit/Popover`, `reakit-system/createComponent`, …) that Node's
    // ESM runtime can't resolve, so the standalone node server crashes at boot
    // with ERR_UNSUPPORTED_DIR_IMPORT unless these are bundled at build time.
    ssr: { noExternal: [/^reakit/] },
    // Pre-bundle deps Vite's startup scan can't see: some are reached only
    // through clientOnly() dynamic imports (ChartBlock → react-google-charts,
    // AssetInlinePDF/AssetPDFPreview → react-pdf), and island entry modules are
    // themselves loaded dynamically by the hydration runtime, so their dep
    // trees can also be discovered late. A late discovery re-optimizes
    // mid-session: stale ?v= module URLs fail with empty-MIME errors, islands
    // fail to hydrate, and Vite forces a full page reload. Add any dep that
    // shows up in a "disallowed MIME type" console error here. Dev-only
    // concern; production builds bundle everything up front.
    optimizeDeps: {
      include: [
        "react-google-charts",
        "react-pdf",
        "urql",
        "@urql/core",
        "@urql/exchange-request-policy",
        "markdown-to-txt",
        "lodash/capitalize",
        "@mdx-js/mdx",
        "react-dom/server",
        "remark-gfm",
      ],
    },
  },
});
