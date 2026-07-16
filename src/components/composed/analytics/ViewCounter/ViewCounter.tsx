"use client";

import { useQuery } from "urql";
import { graphql } from "@/lib/api/gql";
import UrqlProvider from "@/lib/api/UrqlProvider";
import useViewerContext from "@/contexts/useViewerContext";

/**
 * Records a view for an entity by fetching the typename on the client.
 * Fetches on the server do not count towards view metrics.
 *
 * Paused in preview/draft mode: an editor previewing an entity should not
 * record a view (it would pollute the metrics), and the query is anonymous so it
 * never needs the session token. Provides its own (anonymous) urql client —
 * analytics widgets are the only client-side GraphQL left.
 */
export default function ViewCounter(props: { slug: string }) {
  return (
    <UrqlProvider>
      <ViewCounterInner {...props} />
    </UrqlProvider>
  );
}

function ViewCounterInner({ slug }: { slug: string }) {
  const { isPreview } = useViewerContext();

  useQuery({
    query,
    variables: { slug },
    requestPolicy: "network-only",
    pause: isPreview,
  });

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
