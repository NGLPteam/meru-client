"use server";

import { graphql } from "relay-runtime";
import { cache } from "react";
import fetchQuery from "@/lib/relay/fetchQuery";
import { fetchPermalinkQuery as Query } from "@/relay/fetchPermalinkQuery.graphql";

const fetchPermalinkRequest = cache(async (permalink: string) => {
  const { data } = await fetchQuery<Query>(query, { uri: permalink });

  const { kind, permalinkableSlug } = data?.permalinkByUri ?? {};

  return { kind, permalinkableSlug };
});

export async function fetchPermalink(permalink: string) {
  return fetchPermalinkRequest(permalink);
}

const query = graphql`
  query fetchPermalinkQuery($uri: String!) {
    permalinkByUri(uri: $uri) {
      kind
      permalinkableSlug
    }
  }
`;
