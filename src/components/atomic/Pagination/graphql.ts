import { graphql } from "@/lib/api/gql";

export const paginationFragment = graphql(`
  fragment PaginationFragment on PageInfo {
    page
    pageCount
  }
`);
