import { notFound } from "next/navigation";
import { graphql } from "@/lib/api/gql";
import CommunityPageLayout from "@/components/composed/community/CommunityPageLayout";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function CommunityPagePage({ params }: BasePageParams) {
  const { slug, page: pageSlug } = await params;

  const { data } = await queryApi(query, {
    slug,
    pageSlug,
  });

  const { community } = data ?? {};

  if (!community) return notFound();

  return <CommunityPageLayout data={community?.page} />;
}

const query = graphql(`
  query pageTemplatesCommunityPageQuery($slug: Slug!, $pageSlug: String!) {
    community(slug: $slug) {
      page(slug: $pageSlug) {
        ...CommunityPageLayoutFragment
      }
    }
  }
`);
