import { graphql } from "@/lib/api/gql";

export const summaryDetailFragment = graphql(`
  fragment SummaryDetailFragment on DetailTemplateInstance {
    entity {
      ... on Sluggable {
        slug
      }
      ... on Collection {
        __typename
        announcements {
          ...AnnouncementsFragment
          ... on AnnouncementConnection {
            nodes {
              slug
            }
          }
        }
      }
      ... on Community {
        __typename
        announcements {
          ...AnnouncementsFragment
          ... on AnnouncementConnection {
            nodes {
              slug
            }
          }
        }
      }
      ... on Item {
        __typename
        announcements {
          ...AnnouncementsFragment
          ... on AnnouncementConnection {
            nodes {
              slug
            }
          }
        }
      }
    }
    detailDefinition: definition {
      showAnnouncements
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
      subheader {
        ...sharedInlineSlotFragment
      }
      summary {
        ...sharedBlockSlotFragment
      }
    }
  }
`);
