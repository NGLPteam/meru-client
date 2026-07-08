import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import EntityPageLayout from "@/components/composed/entity/EntityPageLayout";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function ItemPagePage({ params }: BasePageParams) {
  const { slug, page } = await params;

  const { data } = await queryApi(query, {
    slug,
    pageSlug: page,
  });

  const { item } = data ?? {};

  if (!item) return notFound();

  return <EntityPageLayout data={item.page} />;
}

const query = graphql(`
  query pageTemplatesItemPageQuery($slug: Slug!, $pageSlug: String!) {
    item(slug: $slug) {
      page(slug: $pageSlug) {
        ...EntityPageLayoutFragment
      }
    }
  }
`);
