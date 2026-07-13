import { graphql } from "@/lib/api/gql";

// Site-level metadata query, split into a queryApi-free module so both the Next
// builder (app/**/_metadata/site.ts, via queryApi) and the Astro builder
// (src/lib/metadata/siteMetadata.ts, via src/lib/query) share one definition
// without a duplicate operation name or dragging the server client into a bundle.
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
