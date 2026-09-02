import { graphql } from "@/lib/api/gql";

export const layoutThemeQuery = graphql(`
  query layoutThemeQuery {
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
