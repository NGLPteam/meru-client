import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import i18n, { DEFAULT_LNG } from "~/lib/i18n";
import config from "~/lib/i18n/config";
import type { APIContext, MiddlewareNext } from "astro";

// In dev, re-read the locale JSON from disk on each request and overwrite the
// resource bundles. The instance bakes in resources at init, so without this an
// edit to a locale file requires a dev-server restart to take effect.
const localesDir = fileURLToPath(new URL("../locales/", import.meta.url));

async function reloadResources() {
  for (const lng of Object.keys(config.resources)) {
    try {
      const data = JSON.parse(
        await readFile(`${localesDir}${lng}.json`, "utf-8"),
      ) as Record<string, object>;
      for (const [ns, bundle] of Object.entries(data)) {
        i18n.removeResourceBundle(lng, ns);
        i18n.addResourceBundle(lng, ns, bundle);
      }
    } catch (err) {
      // A missing locale file is expected (keep the bundled resources), but
      // surface anything else — e.g. a JSON syntax error while editing.
      if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") {
        console.error(`Failed to reload locale "${lng}":`, err);
      }
    }
  }
}

// Entity slugs are opaque 30–32-char ids; match generously so future id-length
// changes don't silently break locals.slug.
const ENTITY_ROUTE =
  /^\/(?:items|collections|communities|contributors)\/([A-Za-z0-9]{20,40})(?:\/|$)/;
const PAGE_ROUTE =
  /^\/(?:items|collections|communities)\/[^/]+\/page\/([^/]+)\/?$/;

// Attaches request context to Astro.locals:
//   - t: the server-side translator (src/lib/i18n singleton).
//   - slug / pageSlug: the current entity route's params, so converted .astro
//     components read them from locals instead of prop-threading.
// Server-island requests (/_server-islands/*) carry the ISLAND url, not the
// page's — t still works there, but slug/pageSlug are left undefined, so
// server:defer islands (OrderingList, SearchResults, AccountNav, FooterNav)
// must keep receiving route state as props.
export async function attachRequestContext(
  context: APIContext,
  next: MiddlewareNext,
) {
  if (import.meta.env.DEV) await reloadResources();

  context.locals.t = i18n.getFixedT(DEFAULT_LNG);

  const { pathname } = context.url;
  if (
    !pathname.startsWith("/_server-islands") &&
    !pathname.startsWith("/api")
  ) {
    context.locals.slug = ENTITY_ROUTE.exec(pathname)?.[1];
    context.locals.pageSlug = PAGE_ROUTE.exec(pathname)?.[1];
  }

  return next();
}
