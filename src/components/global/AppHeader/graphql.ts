import { graphql } from "@/lib/api/gql";

// Header data fragment, unmasked by the Astro header composition and its
// islands (HeaderBrandIsland / HeaderNavIsland). Spread into globalLayoutQuery
// (src/layouts/graphql.ts).
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
