import { graphql } from "@/lib/api/gql";

export const browseListLayoutFragment = graphql(`
  fragment BrowseListLayoutFragment on PageInfo {
    ...PaginationFragment
    ...PageCountFragment
  }
`);
