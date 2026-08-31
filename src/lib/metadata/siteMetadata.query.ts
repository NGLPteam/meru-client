import { graphql } from "@/lib/api/gql";

// Kept in its own queryApi-free module so importing the document never drags
// the server urql client into a client/island bundle.
export const siteMetadataQuery = graphql(`
  query siteMetadataQuery {
    globalConfiguration {
      site {
        installationName
        installationHomePageCopy
      }
      logo {
        original {
          url
        }
      }
      logoMetadata {
        alt
      }
    }
  }
`);
