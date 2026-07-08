import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import AssetsBlock from "@/components/composed/asset/AssetsBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function ItemFilesPage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data } = await queryApi(query, {
    slug,
  });

  const { item } = data ?? {};

  if (!item) return notFound();

  return <AssetsBlock data={item.assets} />;
}

const query = graphql(`
  query pageTemplatesItemFilesQuery($slug: Slug!) {
    item(slug: $slug) {
      assets {
        ...AssetsBlockFragment
      }
    }
  }
`);
