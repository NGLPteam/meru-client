"use client";

// Hydrated island: browse an ordering (/communities/[slug]/browse/[ordering]) —
// the community shell wrapping EntityOrderingLayout. The layout renders the SSR
// fragment data immediately; its urql refetch only fires on pagination.
import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CommunityShell from "./CommunityShell";
import type { communityBrowseQuery } from "../../../lib/queries/community";

type Community = NonNullable<
  DocumentType<typeof communityBrowseQuery>["community"]
>;

type Props = {
  community: Community;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<typeof AppProviders>["draftModeEnabled"];
};

export default function CommunityBrowse({
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
        <EntityOrderingLayout data={community.ordering} showContext="FULL" />
      </CommunityShell>
    </AppProviders>
  );
}
