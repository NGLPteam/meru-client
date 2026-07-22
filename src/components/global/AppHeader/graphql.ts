import { graphql } from "@/lib/api/gql";

// Header data fragment. Lifted out of the former AppHeader.tsx so the Astro
// header composition and its leaf islands (HeaderBrandIsland / HeaderNavIsland)
// can each unmask it. Spread into chromeLayoutQuery (src/lib/chrome/queries.ts).
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
