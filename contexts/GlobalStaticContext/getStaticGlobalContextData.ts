import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";

export default async function getStaticGlobalContextData() {
  const { data: globalStaticData } = await queryApi(query, {});

  return globalStaticData;
}

export const query = graphql(`
  query getStaticGlobalContextDataQuery {
    globalConfiguration {
      site {
        providerName
        installationName
        installationHomePageCopy
        logoMode
        footer {
          description
          copyrightStatement
        }
      }
      entities {
        suppressExternalLinks
      }
    }
    allCommunities: communities(order: POSITION_ASCENDING) {
      edges {
        node {
          slug
          title
        }
      }
    }
  }
`);
