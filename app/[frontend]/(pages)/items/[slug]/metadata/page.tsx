import { graphql } from "relay-runtime";
import { notFound } from "next/navigation";
import { BasePageParams } from "@/types/page";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pageTemplatesItemMetadataQuery as Query } from "@/relay/pageTemplatesItemMetadataQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";
import MetadataTemplate from "@/components/templates/Metadata";
import MainLayout from "@/components/templates/MainLayout";
import { FullTextFallback } from "@/components/templates/FullTextCheck/FullTextCheck";

export async function generateStaticParams() {
  return [];
}

export default async function ItemPage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data, records, sessionToken } = await fetchQuery<Query>(query, {
    slug,
  });

  const { item } = data ?? {};

  if (!item) return notFound();

  const {
    layouts: { metadata, main },
  } = item;

  const { template } = metadata ?? {};

  return template ? (
    <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
      <MetadataTemplate data={template} />
      <FullTextFallback>
        <MainLayout data={main} fallback />
      </FullTextFallback>
    </UpdateClientEnvironment>
  ) : null;
}

const query = graphql`
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
`;
