import type { APIContext } from "astro";
import query from "~/lib/query";
import { sitemapCommunitiesQuery } from "~/lib/sitemap/queries";
import { siteBase, sitemapIndex, xmlResponse } from "~/lib/sitemap/xml";

// Sitemap index. Enumerates one child sitemap per page of communities, and per
// community, one child per page of its collections and items. Child sitemaps
// are served by /sitemap-entities.xml (see that endpoint).
export async function GET(context: APIContext): Promise<Response> {
  const base = siteBase(context);
  const child = (params: Record<string, string | number>) =>
    `${base}/sitemap-entities.xml?${new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
      ),
    ).toString()}`;

  const locs: string[] = [];

  // Walk every page of communities, collecting each community's collection/item
  // page counts as we go.
  let page = 1;
  let pageCount = 1;
  do {
    const { data } = await query(sitemapCommunitiesQuery, { page });
    const communities = data?.communities;
    if (!communities) break;

    pageCount = communities.pageInfo.pageCount || 1;
    locs.push(child({ type: "communities", page }));

    for (const node of communities.nodes) {
      const collectionPages = node.collections.pageInfo.pageCount || 0;
      for (let p = 1; p <= collectionPages; p++) {
        locs.push(
          child({ type: "collections", community: node.slug, page: p }),
        );
      }
      const itemPages = node.items.pageInfo.pageCount || 0;
      for (let p = 1; p <= itemPages; p++) {
        locs.push(child({ type: "items", community: node.slug, page: p }));
      }
    }
    page++;
  } while (page <= pageCount);

  return xmlResponse(sitemapIndex(locs));
}
