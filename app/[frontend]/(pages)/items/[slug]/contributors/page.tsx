import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import ContributionsBlock from "@/components/composed/contribution/ContributionsBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function ItemContributorsPage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data } = await queryApi(query, {
    slug,
  });

  const { item } = data ?? {};

  if (!item || !slug) return notFound();

  return <ContributionsBlock data={item} slug={slug} background="neutral00" />;
}

const query = graphql(`
  query pageTemplatesItemContributorsQuery($slug: Slug!) {
    item(slug: $slug) {
      ...ContributionsBlockFragment
    }
  }
`);
