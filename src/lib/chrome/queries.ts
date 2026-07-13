import { graphql } from "@/lib/api/gql";

// Global-chrome data for the Astro layout. Spreads the header and footer
// fragments directly (rather than via AppBodyFragment) so the single query
// result is a valid FragmentType for BOTH the AppHeader and AppFooter islands —
// each unmasks its own fragment from the same object.
export const chromeLayoutQuery = graphql(`
  query chromeLayoutQuery {
    ...AppHeaderFragment
    ...AppFooterFragment
  }
`);
