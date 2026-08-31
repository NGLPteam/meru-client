import { graphql } from "@/lib/api/gql";

// The GlobalStaticContext query, kept in its own queryApi-free module so
// importing the document never drags the server urql client into a
// client/island bundle.
export const query = graphql(`
  query getStaticGlobalContextDataQuery {
    globalConfiguration {
      theme {
        color
        font
      }
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
