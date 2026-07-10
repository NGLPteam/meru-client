import { graphql } from "@/lib/api/gql";

// Astro layout queries. Operation names are suffixed `AstroQuery` to avoid
// colliding with the still-present Next page queries of the same shape while the
// codegen documents glob scans both app/ and src/ during coexistence. The names
// can be normalized after the Phase 6 cutover.
export const LayoutThemeAstroQuery = graphql(`
  query LayoutThemeAstroQuery {
    globalConfiguration {
      theme {
        color
        font
      }
    }
  }
`);
