"use client";

import SearchLayout from "@/components/composed/search/SearchLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CommunityShell from "./CommunityShell";
import type { communitySearchQuery } from "../../../lib/queries/community";

type Community = NonNullable<
  DocumentType<typeof communitySearchQuery>["community"]
>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunitySearch({
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
        <SearchLayout data={community} scoped />
      </CommunityShell>
    </AppProviders>
  );
}
