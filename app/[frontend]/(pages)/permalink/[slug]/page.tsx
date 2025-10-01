import { graphql } from "relay-runtime";
import { notFound, redirect } from "next/navigation";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pagePermalinkQuery as Query } from "@/relay/pagePermalinkQuery.graphql";
import { getRouteByEntityKind } from "@/helpers/routes";
import { BasePageParams } from "@/types/page";

export const revalidate = 300;

export default async function Permalink({ params }: BasePageParams) {
  const { slug: permalink } = await params;

  const { data } = await fetchQuery<Query>(query, { uri: permalink });

  const { kind, permalinkableSlug } = data?.permalinkByUri ?? {};

  if (!kind || !permalinkableSlug) return notFound();

  const entityPath = `/${getRouteByEntityKind(kind)}/${permalinkableSlug}`;

  return redirect(entityPath);
}

const query = graphql`
  query pagePermalinkQuery($uri: String!) {
    permalinkByUri(uri: $uri) {
      kind
      permalinkableSlug
    }
  }
`;
