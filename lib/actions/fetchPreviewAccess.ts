"use server";

import { graphql } from "relay-runtime";
import { cache } from "react";
import fetchQuery from "@/lib/relay/fetchQuery";
import { fetchPreviewAccessQuery as Query } from "@/relay/fetchPreviewAccessQuery.graphql";

const fetchPreviewAccessRequest = cache(async (slug: string) => {
  const { data } = await fetchQuery<Query>(query, { slug }, true);

  return data?.item?.canUpdate?.value ?? false;
});

export async function fetchPreviewAccess(slug: string) {
  return fetchPreviewAccessRequest(slug);
}

const query = graphql`
  query fetchPreviewAccessQuery($slug: Slug!) {
    item(slug: $slug) {
      canUpdate {
        value
      }
    }
  }
`;
