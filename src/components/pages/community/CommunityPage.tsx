"use client";

import CommunityPageLayout from "@/components/composed/community/CommunityPageLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CommunityShell from "./CommunityShell";
import type { communityPageQuery } from "../../../lib/queries/community";

type Community = NonNullable<
  DocumentType<typeof communityPageQuery>["community"]
>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunityPage({
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
        <CommunityPageLayout data={community.page} />
      </CommunityShell>
    </AppProviders>
  );
}
