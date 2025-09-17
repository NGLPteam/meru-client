import { getCurrentEnvironment as environment } from "@/lib/relay/environment";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { GetServerSidePropsContext } from "next";
import { fetchQuery, graphql } from "relay-runtime";
import { buildSiteMap, getItemsSitemap } from "@/helpers";
import {
  sitemapItemsCollectionQuery,
  sitemapItemsCollectionQuery$data,
} from "@/relay/sitemapItemsCollectionQuery.graphql";

function generateSiteMap(data: sitemapItemsCollectionQuery$data) {
  return data.collection?.items ? getItemsSitemap(data.collection.items) : "";
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
  const data = await fetchQuery<sitemapItemsCollectionQuery>(env, query, {
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
  query sitemapItemsCollectionQuery($slug: Slug!, $page: Int!) {
    collection(slug: $slug) {
      items(page: $page, perPage: 50) {
        ...getItemsSitemapFragment
      }
    }
  }
`;
