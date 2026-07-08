import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";
import MetadataTemplate from "@/components/templates/Metadata";
import MainLayout from "@/components/templates/MainLayout";
import { FullTextFallback } from "@/components/templates/FullTextCheck/FullTextCheck";

export async function generateStaticParams() {
  return [];
}

export default async function ItemPage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data } = await queryApi(query, {
    slug,
  });

  const { item } = data ?? {};

  if (!item) return notFound();

  const {
    layouts: { metadata, main },
  } = item;

  const { template } = metadata ?? {};

  return template ? (
    <>
      <MetadataTemplate data={template} />
      <FullTextFallback>
        <MainLayout data={main} fallback />
      </FullTextFallback>
    </>
  ) : null;
}

const query = graphql(`
  query pageTemplatesItemMetadataQuery($slug: Slug!) {
    item(slug: $slug) {
      layouts {
        metadata {
          template {
            ...MetadataTemplateFragment
          }
        }
        main {
          ...MainLayoutFragment
        }
      }
    }
  }
`);
