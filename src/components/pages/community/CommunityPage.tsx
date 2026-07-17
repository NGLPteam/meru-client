"use client";

// Hydrated island: a named community sub-page (/communities/[slug]/page/[page])
// — the community shell wrapping CommunityPageLayout.
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
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CommunityPage({
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
        <CommunityPageLayout data={community.page} />
      </CommunityShell>
    </AppProviders>
  );
}
