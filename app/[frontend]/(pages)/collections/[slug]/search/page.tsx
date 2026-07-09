import { Suspense } from "react";
import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import { getPredicates } from "@/helpers/search";
import SearchLayout from "@/components/composed/search/SearchLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import queryApi from "@/lib/api/queryApi";
import { BasePageParams } from "@/types/page";

export default async function CollectionSearchPage({
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

  const { collection } = data ?? {};

  if (!collection) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <SearchLayout data={collection} scoped />
    </Suspense>
  );
}

const query = graphql(`
  query pageSearchCollectionQuery(
    $slug: Slug!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    collection(slug: $slug) {
      ...SearchLayoutEntityFragment
    }
  }
`);
