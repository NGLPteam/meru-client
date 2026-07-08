import { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { ResolvingMetadata, Metadata } from "next";
import { graphql } from "@/lib/api/gql";
import UnauthorizedMessage from "@/app/[frontend]/(pages)/unauthorized/_components/UnauthorizedMessage";
import CommunityNavBar from "@/components/composed/community/CommunityNavBar";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";
import generateCommunityMetadata from "@/app/[frontend]/(pages)/communities/[slug]/_metadata/community";
import SetCommunity from "@/components/global/SetCommunity";

export async function generateMetadata(
  props: BasePageParams,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  return generateCommunityMetadata(props, parent);
}

export default async function CommunityLayout({
  children,
  params,
}: BasePageParams & PropsWithChildren) {
  const { slug } = await params;

  const { data } = await queryApi(query, { slug });

  const { community } = data ?? {};

  if (!community) return notFound();

  const { isEnabled: draftModeEnabled } = await draftMode();

  if (draftModeEnabled && !community.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="community" />;
  }

  const { layouts } = community;

  const showNavBar =
    layouts?.hero?.template?.definition?.enableDescendantBrowsing;

  return (
    <SetCommunity data={community}>
      {showNavBar && (
        <CommunityNavBar data={community} entityData={community} />
      )}
      <ProcessingCheck data={layouts} entityType="community">
        {layouts.hero && <HeroTemplate data={layouts.hero} />}
        {children}
      </ProcessingCheck>
    </SetCommunity>
  );
}

const query = graphql(`
  query layoutCommunityTemplateQuery($slug: Slug!) {
    community(slug: $slug) {
      canPreview {
        value
      }
      layouts {
        hero {
          template {
            definition {
              enableDescendantBrowsing
            }
          }
          ...HeroTemplateFragment
        }
        ...ProcessingCheckFragment
      }
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
      ...SetCommunityFragment
    }
  }
`);
