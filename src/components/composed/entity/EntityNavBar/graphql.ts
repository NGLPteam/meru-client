import { graphql } from "@/lib/api/gql";

export const entityNavListFragment = graphql(`
  fragment EntityNavListFragment on Entity {
    __typename
    schemaVersion {
      name
      identifier
    }
    orderings(availability: ENABLED) {
      nodes {
        name
        slug
        identifier
        count
      }
    }
    pages {
      nodes {
        title
        slug
      }
    }
  }
`);

export const entityNavBarFragment = graphql(`
  fragment EntityNavBarFragment on Entity {
    ... on Node {
      id
    }
    ... on Sluggable {
      slug
    }
    ... on Entity {
      title
      ...EntityNavListFragment
      layouts {
        hero {
          template {
            definition {
              enableDescendantBrowsing
              enableDescendantSearch
            }
            slots {
              descendantSearchPrompt {
                ...sharedInlineSlotFragment
              }
            }
          }
        }
      }
    }
  }
`);
