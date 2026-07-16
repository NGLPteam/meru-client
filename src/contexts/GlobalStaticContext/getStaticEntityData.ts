import { graphql } from "@/lib/api/gql";

// The `getStaticEntityData` fetch function was Next-only (server data path via
// queryApi) and left with the Next app. Only the fragment is kept — Astro
// selects it within each entity's own query and reads it via GlobalStaticContext
// (which imports the `fragment` type from here).
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
