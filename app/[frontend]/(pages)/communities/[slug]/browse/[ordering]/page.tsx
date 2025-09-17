import { Suspense } from "react";
import { graphql } from "relay-runtime";
import { notFound } from "next/navigation";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import { OrderingPageParams } from "@/types/page";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pageBrowseCommunityOrderingQuery as OrderingQuery } from "@/relay/pageBrowseCommunityOrderingQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";

export default async function CommunityBrowsePage({
  params,
  searchParams,
}: OrderingPageParams & { searchParams: Promise<Record<string, string>> }) {
  const { slug, ordering } = await params;
  const { page } = await searchParams;

  const { data, records } = await fetchQuery<OrderingQuery>(orderingQuery, {
    slug,
    page: parseInt(page) || 1,
    identifier: ordering,
  });

  const { community } = data ?? {};

  if (!community) return notFound();

  return (
    <UpdateClientEnvironment records={records}>
      <Suspense fallback={<LoadingBlock />}>
        <EntityOrderingLayout data={community?.ordering} showContext="FULL" />
      </Suspense>
    </UpdateClientEnvironment>
  );
}

const orderingQuery = graphql`
  query pageBrowseCommunityOrderingQuery(
    $slug: Slug!
    $identifier: String!
    $page: Int
  ) {
    community(slug: $slug) {
      ordering(identifier: $identifier) {
        disabled
        ...EntityOrderingLayoutFragment
      }
    }
  }
`;
