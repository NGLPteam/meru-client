import { Suspense } from "react";
import { notFound } from "next/navigation";
import { graphql } from "@/lib/api/gql";
import EntityAnnouncementLayout from "@/components/composed/entity/EntityAnnouncementLayout";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function CollectionAnnouncementPage({
  params,
}: BasePageParams) {
  const { slug, announcement } = await params;

  const { data } = await queryApi(query, {
    slug,
    announcementSlug: announcement,
  });

  const { collection } = data ?? {};

  if (!collection) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <EntityAnnouncementLayout data={collection.announcement} />
    </Suspense>
  );
}

const query = graphql(`
  query pageTemplatesCollectionAnnouncementQuery(
    $slug: Slug!
    $announcementSlug: Slug!
  ) {
    collection(slug: $slug) {
      ... on Collection {
        announcement(slug: $announcementSlug) {
          ...EntityAnnouncementLayoutFragment
        }
      }
    }
  }
`);
