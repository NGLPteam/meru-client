import { graphql } from "relay-runtime";
import { notFound } from "next/navigation";
import CollectionContributionsBlock from "@/components/composed/contribution/ContributionsBlock/CollectionContributionsBlock";
import { BasePageParams } from "@/types/page";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pageTemplatesCollectionContributorsQuery as Query } from "@/relay/pageTemplatesCollectionContributorsQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";

export async function generateStaticParams() {
  return [];
}

export default async function CollectionContributorsPage({
  params,
}: BasePageParams) {
  const { slug } = await params;

  const { data, records, sessionToken } = await fetchQuery<Query>(query, {
    slug,
  });

  const { collection } = data ?? {};

  if (!collection || !slug) return notFound();

  return (
    <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
      <CollectionContributionsBlock
        data={collection}
        slug={slug}
        background="neutral00"
      />
    </UpdateClientEnvironment>
  );
}

const query = graphql`
  query pageTemplatesCollectionContributorsQuery($slug: Slug!) {
    collection(slug: $slug) {
      ...CollectionContributionsBlockFragment
    }
  }
`;
