import type { APIContext } from "astro";
import query from "~/lib/query";
import {
  sitemapCommunitiesQuery,
  sitemapCollectionsQuery,
  sitemapItemsQuery,
} from "~/lib/sitemap/queries";
import {
  siteBase,
  urlset,
  xmlResponse,
  type UrlEntry,
} from "~/lib/sitemap/xml";

// Child sitemap: one <urlset> page of entity URLs. Addressed by the index as
//   /sitemap-entities.xml?type=communities&page=N
//   /sitemap-entities.xml?type=collections&community=SLUG&page=N
//   /sitemap-entities.xml?type=items&community=SLUG&page=N
// Each page is a single 200-item API page (see SITEMAP_PAGE_SIZE).
export async function GET(context: APIContext): Promise<Response> {
  const base = siteBase(context);
  const params = context.url.searchParams;
  const type = params.get("type");
  const page = parseInt(params.get("page") ?? "") || 1;
  const community = params.get("community") ?? undefined;

  const entries: UrlEntry[] = [];

  if (type === "communities") {
    // Fold the static entry points into the first communities page.
    if (page === 1) {
      entries.push({ loc: `${base}/` }, { loc: `${base}/search` });
    }
    const { data } = await query(sitemapCommunitiesQuery, { page });
    for (const node of data?.communities?.nodes ?? []) {
      entries.push({
        loc: `${base}/communities/${node.slug}`,
        lastmod: node.updatedAt,
      });
    }
  } else if (type === "collections" && community) {
    const { data, error } = await query(sitemapCollectionsQuery, {
      slug: community,
      page,
    });
    // A dangling descendant nulls the whole page (see sitemapItemsQuery note);
    // log it and emit whatever survived rather than failing the request.
    if (error)
      console.warn(
        `[sitemap] collections ${community} p${page}:`,
        error.message,
      );
    for (const node of data?.community?.descendants.nodes ?? []) {
      const c = node.descendant;
      if (c && "slug" in c) {
        entries.push({
          loc: `${base}/collections/${c.slug}`,
          lastmod: c.updatedAt,
        });
      }
    }
  } else if (type === "items" && community) {
    const { data, error } = await query(sitemapItemsQuery, {
      slug: community,
      page,
    });
    if (error)
      console.warn(`[sitemap] items ${community} p${page}:`, error.message);
    for (const node of data?.community?.descendants.nodes ?? []) {
      const i = node.descendant;
      if (i && "slug" in i) {
        entries.push({ loc: `${base}/items/${i.slug}`, lastmod: i.updatedAt });
      }
    }
  } else {
    return new Response("Not found", { status: 404 });
  }

  return xmlResponse(urlset(entries));
}
