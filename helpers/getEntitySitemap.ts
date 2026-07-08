import { graphql, useFragment as readFragment, type FragmentType } from "@/lib/api/gql";
import EXTERNAL_DATA_URL from "./externalDataUrl";

export default function getEntitySitemap(data: FragmentType<typeof fragment>) {
  const entity = readFragment(fragment, data);

  if ((entity.__typename as string) === "%other") return "";

  const url =
    entity.__typename === "Community"
      ? `${EXTERNAL_DATA_URL}/communities`
      : entity.__typename === "Collection"
        ? `${EXTERNAL_DATA_URL}/collections`
        : `${EXTERNAL_DATA_URL}/items`;

  const collectionCount =
    entity.__typename === "Item" ? 0 : entity.collections?.pageInfo.pageCount;

  const itemCount =
    entity.__typename === "Community" ? 0 : entity.items?.pageInfo.pageCount;

  return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${`${url}/${entity.slug}/sitemap_pages.xml`}</loc>
        <lastmod>${entity.updatedAt}</lastmod>
      </sitemap>
      ${[...Array(collectionCount).keys()].map(
        (i) => `
          <sitemap>
            <loc>${`${url}/${entity.slug}/sitemap_collections.xml?page=${
              i + 1
            }`}</loc>
            <lastmod>${entity.updatedAt}</lastmod>
          </sitemap>
        `,
      )}
      ${[...Array(itemCount).keys()].map(
        (i) => `
          <sitemap>
            <loc>${`${url}/${entity.slug}/sitemap_items.xml?page=${
              i + 1
            }`}</loc>
            <lastmod>${entity.updatedAt}</lastmod>
          </sitemap>
        `,
      )}
    </sitemapindex>
  `;
}

const fragment = graphql(`
  fragment getEntitySitemapFragment on Entity {
    __typename

    ... on Community {
      slug
      updatedAt
      collections(perPage: 50) {
        pageInfo {
          pageCount
        }
      }
    }

    ... on Collection {
      slug
      updatedAt
      collections(perPage: 50) {
        pageInfo {
          pageCount
        }
      }

      items(perPage: 50) {
        pageInfo {
          pageCount
        }
      }
    }

    ... on Item {
      slug
      updatedAt
      items(perPage: 50) {
        pageInfo {
          pageCount
        }
      }
    }
  }
`);
