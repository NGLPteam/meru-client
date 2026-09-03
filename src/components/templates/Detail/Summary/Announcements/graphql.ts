import { graphql } from "@/lib/api/gql";

export const announcementsFragment = graphql(`
  fragment AnnouncementsFragment on AnnouncementConnection {
    nodes {
      teaser
      header
      slug
    }
  }
`);
