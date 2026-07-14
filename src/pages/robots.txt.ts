import type { APIContext } from "astro";
import { siteBase } from "~/lib/sitemap/xml";

// robots.txt — allow all (or block everything when NO_BOTS is set, e.g. on
// preview/staging), and advertise the sitemap index.
export function GET(context: APIContext): Response {
  // Server-only endpoint (never client-bundled), so process.env is safe here;
  // NO_BOTS is unprefixed and would not appear on import.meta.env.
  const noBots = process.env.NO_BOTS === "true";
  const base = siteBase(context);
  const body = noBots
    ? `User-agent: *\nDisallow: /\n`
    : `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
