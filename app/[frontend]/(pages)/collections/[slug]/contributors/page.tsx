import { notFound } from "next/navigation";
import { graphql } from "@/lib/api/gql";
import CollectionContributionsBlock from "@/components/composed/contribution/ContributionsBlock/CollectionContributionsBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function CollectionContributorsPage({
  params,
}: BasePageParams) {
  const { slug } = await params;

  const { data } = await queryApi(query, {
    slug,
  });

  const { collection } = data ?? {};

  if (!collection || !slug) return notFound();

  return (
    <CollectionContributionsBlock
      data={collection}
      slug={slug}
      background="neutral00"
    />
  );
}

const query = graphql(`
  query pageTemplatesCollectionContributorsQuery($slug: Slug!) {
    collection(slug: $slug) {
      ...CollectionContributionsBlockFragment
    }
  }
`);
