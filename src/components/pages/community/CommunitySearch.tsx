"use client";

// Hydrated island: scoped community search (/communities/[slug]/search) — the
// community shell wrapping SearchLayout. SearchLayout drives results via a
// client-side urql query keyed off the URL search params.
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
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
};

export default function CommunitySearch({
  community,
  globalData,
  route,
  viewer,
}: Props) {
  return (
    <AppProviders
      community={community}
      globalData={globalData}
      route={route}
      viewer={viewer}
    >
      <CommunityShell data={community}>
        <SearchLayout data={community} scoped />
      </CommunityShell>
    </AppProviders>
  );
}
