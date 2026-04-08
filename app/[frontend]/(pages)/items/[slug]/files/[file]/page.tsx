import { graphql } from "relay-runtime";
import { notFound } from "next/navigation";
import AssetDetailBlock from "@/components/composed/asset/AssetDetailBlock";
import { BasePageParams } from "@/types/page";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pageTemplatesItemFileDetailQuery as Query } from "@/relay/pageTemplatesItemFileDetailQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";

export async function generateStaticParams() {
  return [];
}

export default async function ItemFileDetailPage({ params }: BasePageParams) {
  const { file } = await params;

  const { data, records, sessionToken } = await fetchQuery<Query>(query, {
    file,
  });

  const { asset } = data ?? {};

  if (!asset) return notFound();

  return (
    <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
      <AssetDetailBlock data={asset} />
    </UpdateClientEnvironment>
  );
}

const query = graphql`
  query pageTemplatesItemFileDetailQuery($file: Slug!) {
    asset(slug: $file) {
      ...AssetDetailBlockFragment
    }
  }
`;
