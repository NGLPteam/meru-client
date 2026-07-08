import { graphql, type DocumentType } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import { GetServerSidePropsContext } from "next";
import { buildSiteMap, EXTERNAL_DATA_URL } from "@/helpers";

function generateSiteMap(data: DocumentType<typeof query>) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <sitemap>
       <loc>${EXTERNAL_DATA_URL}/sitemap_pages.xml</loc>
     </sitemap>
     ${data?.communities?.nodes
       .map(({ slug }) => {
         return `
       <sitemap>
          <loc>${`${EXTERNAL_DATA_URL}/communities/${slug}/sitemap.xml`}</loc>
       </sitemap>
     `;
       })
       .join("")}
   </sitemapindex>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }: GetServerSidePropsContext) {
  const { data } = await queryApi(query, {});

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
  query sitemapQuery {
    communities {
      nodes {
        slug
      }
    }
  }
`);
