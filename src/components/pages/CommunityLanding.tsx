"use client";

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
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunityLanding({
  community,
  globalData,
  route,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={community}
      globalData={globalData}
      route={route}
      draftModeEnabled={draftModeEnabled}
    >
      <CommunityShell data={community}>
        <MainLayout data={community.layouts.main} computedBgStart="NONE" />
      </CommunityShell>
    </AppProviders>
  );
}
