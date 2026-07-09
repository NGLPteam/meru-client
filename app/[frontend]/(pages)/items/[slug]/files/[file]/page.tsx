import { notFound } from "@/lib/routing/navigation";
import { graphql } from "@/lib/api/gql";
import AssetDetailBlock from "@/components/composed/asset/AssetDetailBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function ItemFileDetailPage({ params }: BasePageParams) {
  const { file } = await params;

  const { data } = await queryApi(query, {
    file,
  });

  const { asset } = data ?? {};

  if (!asset) return notFound();

  return <AssetDetailBlock data={asset} />;
}

const query = graphql(`
  query pageTemplatesItemFileDetailQuery($file: Slug!) {
    asset(slug: $file) {
      ...AssetDetailBlockFragment
    }
  }
`);
