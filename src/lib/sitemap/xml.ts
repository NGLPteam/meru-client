// Sitemap plumbing: page size, base-URL resolution, XML builders, and the
// cached XML response. The API caps descendants `perPage` at 200, so one child
// sitemap file maps 1:1 to one API page — the index and the child endpoints
// share this page size so page numbers line up.
import serverEnv from "../env/serverEnv";

export const SITEMAP_PAGE_SIZE = 200;

// NEXT_PUBLIC_* are the legacy deploy names — drop the fallbacks once the
// deploy config is renamed.
const MAXAGE =
  serverEnv("SITEMAP_CACHE_MAXAGE", "NEXT_PUBLIC_SITEMAP_CACHE_MAXAGE") ??
  "86400";
const REVALIDATE =
  serverEnv(
    "SITEMAP_CACHE_REVALIDATE",
    "NEXT_PUBLIC_SITEMAP_CACHE_REVALIDATE",
  ) ?? "59";

// Prefer the configured `site` (astro.config), fall back to the request origin
// (dev, or when the env is unset). No trailing slash.
export function siteBase(context: { site?: URL; url: URL }): string {
  return (context.site?.href ?? context.url.origin).replace(/\/$/, "");
}

const escapeXml = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string,
  );

export type UrlEntry = { loc: string; lastmod?: string | null };

export function urlset(entries: UrlEntry[]): string {
  const body = entries
    .map(
      ({ loc, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(loc)}</loc>${
          lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ""
        }\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function sitemapIndex(locs: string[]): string {
  const body = locs
    .map((loc) => `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n  </sitemap>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function xmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, s-maxage=${MAXAGE}, stale-while-revalidate=${REVALIDATE}`,
    },
  });
}
