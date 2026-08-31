import { graphql } from "@/lib/api/gql";

// Header data fragment, unmasked by the Astro header composition and its leaf
// islands (HeaderBrandIsland / HeaderNavIsland). Spread into chromeLayoutQuery
// (src/lib/chrome/queries.ts).
export const AppHeaderFragment = graphql(`
  fragment AppHeaderFragment on Query {
    communities(order: POSITION_ASCENDING) {
      pageInfo {
        totalCount
      }
    }
    globalConfiguration {
      site {
        logoMode
      }
      ...InstallationNameFragment
    }
    ...CommunityPickerFragment
  }
`);
