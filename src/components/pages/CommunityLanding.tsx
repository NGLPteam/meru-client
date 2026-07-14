"use client";

// Hydrated island: the community landing body. Combines the Next community
// layout (nav bar + hero + processing check) and page (main layout) into one
// React tree under the app provider stack — the community is threaded in as a
// prop (replacing SetCommunity), so the header chrome and this content share it.
import CommunityNavBar from "@/components/composed/community/CommunityNavBar";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import MainLayout from "@/components/templates/MainLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../providers/AppProviders";
import type { communityQuery } from "../../lib/queries/community";

type Community = NonNullable<DocumentType<typeof communityQuery>["community"]>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
};

export default function CommunityLanding({
  community,
  globalData,
  route,
}: Props) {
  const { layouts } = community;
  const showNavBar =
    layouts?.hero?.template?.definition?.enableDescendantBrowsing;

  return (
    <AppProviders community={community} globalData={globalData} route={route}>
      {showNavBar && (
        <CommunityNavBar data={community} entityData={community} />
      )}
      <ProcessingCheck data={layouts} entityType="community">
        {layouts.hero && <HeroTemplate data={layouts.hero} />}
        <MainLayout data={layouts.main} computedBgStart="NONE" />
      </ProcessingCheck>
    </AppProviders>
  );
}
