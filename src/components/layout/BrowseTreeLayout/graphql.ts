import { graphql } from "@/lib/api/gql";

export const browseTreeLayoutFragment = graphql(`
  fragment BrowseTreeLayoutFragment on OrderingEntryConnection {
    nodes {
      id
      treeDepth
      ancestors {
        id
        treeDepth
        ...BrowseTreeItemFragment
      }
      ...BrowseTreeItemFragment
    }
    pageInfo {
      ...PaginationFragment
      ...PageCountFragment
    }
  }
`);
