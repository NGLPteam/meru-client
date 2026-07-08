import { notFound } from "next/navigation";
import { graphql, type DocumentType } from "@/lib/api/gql";
import ContributorDetail from "@/components/composed/contributor/ContributorDetail";
import ContributorDetailNav from "@/components/composed/contributor/ContributorDetailNav";
import queryApi from "@/lib/api/queryApi";
import { BasePageParams } from "@/types/page";
import SetCommunity from "@/components/global/SetCommunity";

export default async function ContributorPage({
  params,
  searchParams,
}: BasePageParams & { searchParams: Promise<Record<string, string>> }) {
  const { slug } = await params;
  const {
    item: itemSlug,
    collection: collectionSlug,
    page = "1",
  } = (await searchParams) ?? {};

  const query = itemSlug
    ? itemQuery
    : collectionSlug
      ? collectionQuery
      : detailQuery;

  const { data: rawData } = await queryApi(query, {
    slug,
    item: itemSlug,
    collection: collectionSlug,
    page: parseInt(page),
  });

  // `query` is one of three documents chosen at runtime, so type the result as
  // the (partial) union of their shapes.
  const data = rawData as
    | Partial<
        DocumentType<typeof itemQuery> &
          DocumentType<typeof collectionQuery> &
          DocumentType<typeof detailQuery>
      >
    | undefined;

  const contributor = data?.contributor;

  if (!contributor) return notFound();

  const item = data?.item;
  const collection = data?.collection;

  const community = item?.community ?? collection?.community ?? undefined;

  return (
    <SetCommunity data={community}>
      {item && <ContributorDetailNav data={item} />}
      {collection && <ContributorDetailNav data={collection} />}
      <ContributorDetail data={contributor} />
    </SetCommunity>
  );
}

const detailQuery = graphql(`
  query pageContributorDetailQuery($slug: Slug!, $page: Int) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }
  }
`);

const itemQuery = graphql(`
  query pageContributorItemDetailQuery($slug: Slug!, $item: Slug!, $page: Int) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }

    item(slug: $item) {
      ...ContributorDetailNavFragment

      community {
        ...SetCommunityFragment
      }
    }
  }
`);

const collectionQuery = graphql(`
  query pageContributorCollectionLayoutQuery(
    $slug: Slug!
    $collection: Slug!
    $page: Int
  ) {
    contributor(slug: $slug) {
      ...ContributorDetailFragment
    }

    collection(slug: $collection) {
      ...ContributorDetailNavFragment

      community {
        ...SetCommunityFragment
      }
    }
  }
`);
