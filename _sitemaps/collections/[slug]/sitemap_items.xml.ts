import { graphql, type DocumentType } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { GetServerSidePropsContext } from "next";
import { buildSiteMap, getItemsSitemap } from "@/helpers";

function generateSiteMap(data: DocumentType<typeof query>) {
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
  query sitemapItemsCollectionQuery($slug: Slug!, $page: Int!) {
    collection(slug: $slug) {
      items(page: $page, perPage: 50) {
        ...getItemsSitemapFragment
      }
    }
  }
`);
