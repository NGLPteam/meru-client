import { graphql } from "@/lib/api/gql";

// Operation names keep the `AstroQuery` suffix from the Next-coexistence
// period (they had to avoid colliding with same-shape Next queries in codegen);
// they can be normalized now that app/ is gone.
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
