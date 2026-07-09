import { Suspense } from "react";
import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import SearchLayout from "@/components/composed/search/SearchLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { getPredicates } from "@/helpers/search";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export default async function CommunitySearchPage({
  params,
  searchParams,
}: BasePageParams & { searchParams: Promise<Record<string, string>> }) {
  const { slug } = await params;
  const { q, filters, page, order, schema } = await searchParams;

  const predicates = filters ? getPredicates(JSON.parse(filters)) : [];

  const { data } = await queryApi(query, {
    slug,
    ...(q && { query: q }),
    predicates,
    page: page ? parseInt(page) : 1,
    order: order ?? "PUBLISHED_ASCENDING",
    schema: schema ? schema.split(",") : [],
  });

  const { community } = data ?? {};

  if (!community) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <SearchLayout data={community} scoped />
    </Suspense>
  );
}

const query = graphql(`
  query pageTemplatesSearchCommunityQuery(
    $slug: Slug!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    community(slug: $slug) {
      ...SearchLayoutEntityFragment
    }
  }
`);
