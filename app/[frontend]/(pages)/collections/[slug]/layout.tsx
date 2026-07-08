import { PropsWithChildren } from "react";
import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { ResolvingMetadata, Metadata } from "next";
import UnauthorizedMessage from "@/app/[frontend]/(pages)/unauthorized/_components/UnauthorizedMessage";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";
import ViewCounter from "@/components/composed/analytics/ViewCounter";
import EntityNavBar from "@/components/composed/entity/EntityNavBar";
import generateCollectionMetadata from "@/app/[frontend]/(pages)/collections/[slug]/_metadata/collection";
import SetCommunity from "@/components/global/SetCommunity";

export async function generateMetadata(
  props: BasePageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return generateCollectionMetadata(props, parent);
}

export default async function CollectionTemplateLayout({
  children,
  params,
}: BasePageParams & PropsWithChildren) {
  const { slug } = await params;

  const { data } = await queryApi(query, { slug });

  const { collection } = data ?? {};

  if (!collection) return notFound();

  const { isEnabled: draftModeEnabled } = await draftMode();

  if (draftModeEnabled && !collection.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="collection" />;
  }

  const { community, layouts } = collection;

  return (
    <SetCommunity data={community}>
      {layouts.hero && <HeroTemplate data={layouts.hero} />}
      <ProcessingCheck data={layouts} entityType="collection">
        {slug && <ViewCounter slug={slug} />}
        <EntityNavBar data={collection} />
        {children}
      </ProcessingCheck>
    </SetCommunity>
  );
}

const query = graphql(`
  query layoutCollectionTemplateQuery($slug: Slug!) {
    collection(slug: $slug) {
      canPreview {
        value
      }
      layouts {
        hero {
          ...HeroTemplateFragment
        }
        ...ProcessingCheckFragment
      }
      ...SearchButtonFragment
      ...EntityNavBarFragment

      community {
        ...SetCommunityFragment
      }
    }
  }
`);
