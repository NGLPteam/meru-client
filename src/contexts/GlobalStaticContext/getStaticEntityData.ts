import { graphql } from "@/lib/api/gql";

// Fragment only — no fetch function. Each entity page selects it within its
// own query; GlobalStaticContext reads it (and imports the `fragment` type
// from here).
export const fragment = graphql(`
  fragment getStaticEntityDataFragment on Entity {
    ... on Entity {
      title
      summary
      thumbnail {
        storage
        medium {
          webp {
            url
            width
            height
          }
        }
      }
      thumbnailMetadata {
        alt
      }
      heroImage {
        storage
        medium {
          webp {
            url
            width
            height
          }
        }
      }
      heroImageMetadata {
        alt
      }
    }
  }
`);
