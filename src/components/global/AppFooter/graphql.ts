import { graphql } from "@/lib/api/gql";

// Footer data fragment. Lifted out of the former AppFooter.tsx so the Astro footer
// composition and its body island can unmask it. Spread into chromeLayoutQuery
// (src/lib/chrome/queries.ts).
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
