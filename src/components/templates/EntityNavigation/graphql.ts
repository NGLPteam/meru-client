import { graphql } from "@/lib/api/gql";

export const entityNavigationTemplateFragment = graphql(`
  fragment EntityNavigationTemplateFragment on NavigationLayoutInstance {
    template {
      definition {
        background
      }
      ...NavigationTabsFragment
    }
  }
`);

export const navigationTabsFragment = graphql(`
  fragment NavigationTabsFragment on NavigationTemplateInstance {
    entity {
      ... on Item {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        contributions {
          pageInfo {
            totalCount
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
      ... on Collection {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        contributions {
          pageInfo {
            totalCount
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
      ... on Community {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
    }
    definition {
      hideMetadata
    }
    slots {
      entityLabel {
        ...sharedInlineSlotFragment
      }
    }
  }
`);
