"use client";

// Hydrated island: the community landing body — the community shell (nav + hero
// + processing check) wrapping the main layout. Community threaded as a prop
// (replacing SetCommunity) so the header chrome and this content share it.
import MainLayout from "@/components/templates/MainLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../providers/AppProviders";
import CommunityShell from "./community/CommunityShell";
import type { communityQuery } from "../../lib/queries/community";

type Community = NonNullable<DocumentType<typeof communityQuery>["community"]>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunityLanding({
  community,
  globalData,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={community}
      globalData={globalData}
      route={route}
      viewer={viewer}
      draftModeEnabled={draftModeEnabled}
    >
      <CommunityShell data={community}>
        <MainLayout data={community.layouts.main} computedBgStart="NONE" />
      </CommunityShell>
    </AppProviders>
  );
}
