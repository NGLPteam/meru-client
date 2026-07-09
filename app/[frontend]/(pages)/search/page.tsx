import { Suspense } from "react";
import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import SearchLayout from "@/components/composed/search/SearchLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { getPredicates } from "@/helpers/search";
import queryApi from "@/lib/api/queryApi";
import SetCommunity from "@/components/global/SetCommunity";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { q, filters, page, order, schema } = await searchParams;

  const predicates = filters ? getPredicates(JSON.parse(filters)) : [];

  const { data } = await queryApi(query, {
    ...(q && { query: q }),
    predicates,
    page: page ? parseInt(page) : 1,
    order: order ?? "PUBLISHED_ASCENDING",
    schema: schema ? schema.split(",") : [],
  });

  if (!data) return notFound();

  return (
    <SetCommunity>
      <Suspense fallback={<LoadingBlock />}>
        <SearchLayout data={data} />
      </Suspense>
    </SetCommunity>
  );
}

const query = graphql(`
  query pageSearchQuery(
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    ...SearchLayoutFragment
  }
`);
