import { graphql } from "@/lib/api/gql";

// Preview-access probe: does the viewer have edit rights on this entity? Used by
// the /preview/[entity]/[slug] deep-link gate. The query string is byte-identical
// to the Next `lib/actions/fetchPreviewAccess.ts` one so codegen resolves it to
// the already-registered document (no regen needed); it outlives the Next file.
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
