import { PropsWithChildren } from "react";
import { graphql } from "relay-runtime";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { ResolvingMetadata, Metadata } from "next";
import UnauthorizedMessage from "@/app/[frontend]/(pages)/unauthorized/_components/UnauthorizedMessage";
import CommunityNavBar from "@/components/composed/community/CommunityNavBar";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import { BasePageParams } from "@/types/page";
import fetchQuery from "@/lib/relay/fetchQuery";
import { layoutCommunityTemplateQuery as Query } from "@/relay/layoutCommunityTemplateQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";
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

  const { data, records, sessionToken } = await fetchQuery<Query>(query, {
    slug,
  });

  const { community } = data ?? {};

  if (!community) return notFound();

  const { isEnabled: draftModeEnabled } = await draftMode();

  if (draftModeEnabled && !community.canUpdate?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="community" />;
  }

  const { layouts } = community;

  const showNavBar =
    layouts?.hero?.template?.definition?.enableDescendantBrowsing;

  return (
    <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
      <SetCommunity data={community}>
        {showNavBar && (
          <CommunityNavBar data={community} entityData={community} />
        )}
        <ProcessingCheck data={layouts} entityType="community">
          {layouts.hero && <HeroTemplate data={layouts.hero} />}
          {children}
        </ProcessingCheck>
      </SetCommunity>
    </UpdateClientEnvironment>
  );
}

const query = graphql`
  query layoutCommunityTemplateQuery($slug: Slug!) {
    community(slug: $slug) {
      canUpdate {
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
`;
