"use server";

import { graphql } from "relay-runtime";
import { cache } from "react";
import fetchQuery from "@/lib/relay/fetchQuery";
import { fetchPreviewAccessQuery as Query } from "@/relay/fetchPreviewAccessQuery.graphql";

const fetchPreviewAccessRequest = cache(
  async (entity: string, slug: string) => {
    const { data } = await fetchQuery<Query>(
      query,
      {
        slug,
        isItem: entity === "items",
        isCollection: entity === "collections",
        isCommunity: entity === "communities",
      },
      true,
    );

    return (
      data?.item?.canUpdate?.value ??
      data?.collection?.canUpdate?.value ??
      data?.community?.canUpdate?.value ??
      false
    );
  },
);

export async function fetchPreviewAccess(entity: string, slug: string) {
  return fetchPreviewAccessRequest(entity, slug);
}

const query = graphql`
  query fetchPreviewAccessQuery(
    $slug: Slug!
    $isItem: Boolean!
    $isCollection: Boolean!
    $isCommunity: Boolean!
  ) {
    item(slug: $slug) @include(if: $isItem) {
      canUpdate {
        value
      }
    }
    collection(slug: $slug) @include(if: $isCollection) {
      canUpdate {
        value
      }
    }
    community(slug: $slug) @include(if: $isCommunity) {
      canUpdate {
        value
      }
    }
  }
`;
