"use client";

import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "@/components/providers/AppProviders";
import type { communityBrowseQuery } from "@/lib/queries/community";
import CommunityShell from "./CommunityShell";

type Community = NonNullable<
  DocumentType<typeof communityBrowseQuery>["community"]
>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunityBrowse({
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
        <EntityOrderingLayout data={community.ordering} showContext="FULL" />
      </CommunityShell>
    </AppProviders>
  );
}
