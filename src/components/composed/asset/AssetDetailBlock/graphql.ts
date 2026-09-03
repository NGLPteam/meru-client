import { graphql } from "@/lib/api/gql";

export const assetDetailBlockFragment = graphql(`
  fragment AssetDetailBlockFragment on Node {
    ... on Asset {
      slug
      caption
      kind
      downloadUrl
      fileSize
      name
      altText
      preview {
        storage
        ...ContentImageFragment
      }
    }
    ... on AssetImage {
      updatedAt
    }
  }
`);
