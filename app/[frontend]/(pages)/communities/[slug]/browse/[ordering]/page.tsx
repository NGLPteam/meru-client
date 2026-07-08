import { Suspense } from "react";
import { notFound } from "next/navigation";
import { graphql } from "@/lib/api/gql";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import { OrderingPageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export default async function CommunityBrowsePage({
  params,
  searchParams,
}: OrderingPageParams & { searchParams: Promise<Record<string, string>> }) {
  const { slug, ordering } = await params;
  const { page } = await searchParams;

  const { data } = await queryApi(orderingQuery, {
    slug,
    page: parseInt(page) || 1,
    identifier: ordering,
  });

  const { community } = data ?? {};

  if (!community) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <EntityOrderingLayout data={community?.ordering} showContext="FULL" />
    </Suspense>
  );
}

const orderingQuery = graphql(`
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
`);
