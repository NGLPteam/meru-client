import { graphql, type DocumentType } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { GetServerSidePropsContext } from "next";
import { buildSiteMap, EXTERNAL_DATA_URL } from "@/helpers";

function generateSiteMap(data: DocumentType<typeof query>) {
  const slug = data?.item?.slug;

  const pages = data?.item?.pages?.nodes.map(({ slug, updatedAt }) => {
    return `
      <url>
        <loc>${`${EXTERNAL_DATA_URL}/item/${slug}/page/${slug}`}</loc>
        <lastmod>${updatedAt}</lastmod>
      </url>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${EXTERNAL_DATA_URL}/item/${slug}</loc>
       <lastmod>${data?.item?.updatedAt}</lastmod>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/item/${slug}/search</loc>
     </url>
     ${pages?.join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({
  res,
  query: urlQuery,
}: GetServerSidePropsContext) {
  const slug = routeQueryArrayToString(urlQuery?.slug);

  const { data } = await queryApi(query, { slug });

  if (data) {
    const sitemap = generateSiteMap(data);
    buildSiteMap(res, sitemap);
  }

  return {
    props: {},
  };
}

export default SiteMap;

const query = graphql(`
  query sitemapPagesItemQuery($slug: Slug!) {
    item(slug: $slug) {
      slug
      updatedAt
      pages {
        nodes {
          slug
          updatedAt
        }
      }
    }
  }
`);
