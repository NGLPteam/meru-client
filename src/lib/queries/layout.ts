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

// Header + footer data for BaseLayout. Spreads the two fragments directly
// (rather than via AppBodyFragment) so the single query result is a valid
// FragmentType for BOTH the AppHeader and AppFooter islands — each unmasks its
// own fragment from the same object.
export const globalLayoutQuery = graphql(`
  query globalLayoutQuery {
    ...AppHeaderFragment
    ...AppFooterFragment
  }
`);
