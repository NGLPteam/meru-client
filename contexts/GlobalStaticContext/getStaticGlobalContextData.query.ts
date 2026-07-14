import { graphql } from "@/lib/api/gql";

// The GlobalStaticContext query, split out from getStaticGlobalContextData.ts
// (which imports the server-only queryApi -> urql client). Keeping the document
// in its own queryApi-free module lets both the Next server fetch and the Astro
// layout (via src/lib/query) share one definition without dragging the server
// client into a client/island bundle.
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
