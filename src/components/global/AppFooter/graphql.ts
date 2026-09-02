import { graphql } from "@/lib/api/gql";

// Footer data fragment, unmasked by the Astro footer composition and its body
// island. Spread into globalLayoutQuery (src/layouts/graphql.ts).
export const AppFooterFragment = graphql(`
  fragment AppFooterFragment on Query {
    communities(order: POSITION_ASCENDING) {
      pageInfo {
        totalCount
      }
    }
    globalConfiguration {
      ...InstallationNameFragment
    }
    ...CommunityPickerFragment
  }
`);
