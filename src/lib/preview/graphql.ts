import { graphql } from "@/lib/api/gql";

// Preview-access probe: does the viewer have edit rights on this entity? Used by
// the /preview/[entity]/[slug] deep-link gate.
export const previewAccessQuery = graphql(`
  query fetchPreviewAccessQuery(
    $slug: Slug!
    $isItem: Boolean!
    $isCollection: Boolean!
    $isCommunity: Boolean!
  ) {
    item(slug: $slug) @include(if: $isItem) {
      canUpdate {
        value
      }
    }
    collection(slug: $slug) @include(if: $isCollection) {
      canUpdate {
        value
      }
    }
    community(slug: $slug) @include(if: $isCommunity) {
      canUpdate {
        value
      }
    }
  }
`);
