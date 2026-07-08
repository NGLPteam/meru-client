"use server";

import { cache } from "react";
import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";

const fetchPermalinkRequest = cache(async (permalink: string) => {
  const { data } = await queryApi(query, { uri: permalink });

  const { kind, permalinkableSlug } = data?.permalinkByUri ?? {};

  return { kind, permalinkableSlug };
});

export async function fetchPermalink(permalink: string) {
  return fetchPermalinkRequest(permalink);
}

const query = graphql(`
  query fetchPermalinkQuery($uri: String!) {
    permalinkByUri(uri: $uri) {
      kind
      permalinkableSlug
    }
  }
`);
