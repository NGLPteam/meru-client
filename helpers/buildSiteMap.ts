import { ServerResponse } from "http";

// Guard `process` so eager dev-mode barrel loading into a client bundle doesn't
// throw "process is not defined"; sitemap generation only runs server-side.
const procEnv: Record<string, string | undefined> =
  typeof process !== "undefined" ? process.env : {};

const MAXAGE = procEnv.NEXT_PUBLIC_SITEMAP_CACHE_MAXAGE || "86400";
const REVALIDATE = procEnv.NEXT_PUBLIC_SITEMAP_CACHE_REVALIDATE || "59";

export default async function buildSiteMap(
  res: ServerResponse,
  sitemap: string,
) {
  res.setHeader(
    "Cache-Control",
    `public, s-maxage=${MAXAGE}, stale-while-revalidate=${REVALIDATE}`,
  );
  res.setHeader("Content-Type", "text/xml");
  res.write(sitemap);
  res.end();
}
