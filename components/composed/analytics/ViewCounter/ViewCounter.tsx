"use client";

import { useQuery } from "urql";
import { graphql } from "@/lib/api/gql";

/**
 * Records a view for an entity by fetching the typename on the client.
 * Fetches on the server do not count towards view metrics.
 */
export default function ViewCounter({ slug }: { slug: string }) {
  useQuery({ query, variables: { slug }, requestPolicy: "network-only" });

  return <></>;
}

const query = graphql(`
  query ViewCounterQuery($slug: Slug!) {
    item(slug: $slug) {
      __typename
      entityViews {
        total
      }
      assetDownloads {
        total
      }
    }
    collection(slug: $slug) {
      __typename
      entityViews {
        total
      }
      assetDownloads {
        total
      }
    }
    community(slug: $slug) {
      __typename
    }
  }
`);
