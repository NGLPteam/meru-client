import { Suspense, ComponentProps } from "react";
import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { OrderingPageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

type ContextType = ComponentProps<typeof EntityOrderingLayout>["showContext"];

export default async function CollectionBrowsePage({
  params,
  searchParams,
}: OrderingPageParams & {
  searchParams: Promise<{ context: ContextType; page: string }>;
}) {
  const { slug, ordering } = await params;
  const { context, page } = await searchParams;

  const { data } = await queryApi(query, {
    identifier: ordering,
    page: parseInt(page) || 1,
    slug,
  });

  const { collection } = data ?? {};

  if (!collection) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <EntityOrderingLayout data={collection.ordering} showContext={context} />
    </Suspense>
  );
}

const query = graphql(`
  query pageTemplatesBrowseCollectionQuery(
    $slug: Slug!
    $identifier: String!
    $page: Int
  ) {
    collection(slug: $slug) {
      ordering(identifier: $identifier) {
        disabled
        ...EntityOrderingLayoutFragment
      }
    }
  }
`);
