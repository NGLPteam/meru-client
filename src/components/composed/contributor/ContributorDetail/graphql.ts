import { graphql } from "@/lib/api/gql";

export const contributorDetailFragment = graphql(`
  fragment ContributorDetailFragment on Contributor {
    ... on Node {
      id
    }
    ...ContributorNameFragment
    ... on Contributor {
      bio
      orcid
      attributions(page: $page, perPage: 25) {
        nodes {
          ... on ContributorItemAttribution {
            id
          }
          ... on ContributorCollectionAttribution {
            id
          }
          ...ContributionSummaryFragment
        }
        pageInfo {
          totalCount
          ...BrowseListLayoutFragment
        }
      }
      image {
        storage
        ...ContributorAvatarFragment
      }
      links {
        title
        url
      }
    }
    ... on PersonContributor {
      affiliation
      title
    }
  }
`);
