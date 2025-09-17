import { getCurrentEnvironment as environment } from "@/lib/relay/environment";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { GetServerSidePropsContext } from "next";
import { fetchQuery, graphql } from "relay-runtime";
import { buildSiteMap, getCollectionsSitemap } from "@/helpers";
import {
  sitemapCollectionsCommunityQuery,
  sitemapCollectionsCommunityQuery$data,
} from "@/relay/sitemapCollectionsCommunityQuery.graphql";

function generateSiteMap(data: sitemapCollectionsCommunityQuery$data) {
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

  const env = environment();
  const data = await fetchQuery<sitemapCollectionsCommunityQuery>(env, query, {
    slug,
    page,
  }).toPromise();

  if (data) {
    const sitemap = generateSiteMap(data);
    buildSiteMap(res, sitemap);
  }

  return {
    props: {},
  };
}

export default SiteMap;

const query = graphql`
  query sitemapCollectionsCommunityQuery($slug: Slug!, $page: Int!) {
    community(slug: $slug) {
      collections(page: $page, perPage: 50) {
        ...getCollectionsSitemapFragment
      }
    }
  }
`;
