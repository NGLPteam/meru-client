import { graphql, type DocumentType } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { GetServerSidePropsContext } from "next";
import { buildSiteMap, getCollectionsSitemap } from "@/helpers";

function generateSiteMap(data: DocumentType<typeof query>) {
  return data.community?.collections
    ? getCollectionsSitemap(data.community.collections)
    : "";
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({
  res,
  query: urlQuery,
}: GetServerSidePropsContext) {
  const slug = routeQueryArrayToString(urlQuery?.slug);
  const page = parseInt(routeQueryArrayToString(urlQuery?.page), 10);

  const { data } = await queryApi(query, { slug, page });

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
  query sitemapCollectionsCommunityQuery($slug: Slug!, $page: Int!) {
    community(slug: $slug) {
      collections(page: $page, perPage: 50) {
        ...getCollectionsSitemapFragment
      }
    }
  }
`);
