import { Suspense } from "react";
import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import EntityPageLayout from "@/components/composed/entity/EntityPageLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function CollectionPagePage({ params }: BasePageParams) {
  const { slug, page: pageSlug } = await params;

  const { data } = await queryApi(query, {
    slug,
    pageSlug,
  });

  const { collection } = data ?? {};

  if (!collection) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <EntityPageLayout data={collection.page} />
    </Suspense>
  );
}

const query = graphql(`
  query pageTemplatesCollectionPageQuery($slug: Slug!, $pageSlug: String!) {
    collection(slug: $slug) {
      page(slug: $pageSlug) {
        ...EntityPageLayoutFragment
      }
    }
  }
`);
