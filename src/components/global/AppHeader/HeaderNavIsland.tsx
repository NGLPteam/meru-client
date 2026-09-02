"use client";

// Right header cluster (desktop): community nav list + search button. A
// cache-safe island (no viewer) wrapped in GlobalIslandProviders. Rendered
// only off community-root/home/search — that gating happens in AppHeader.astro.
import CommunityNavList from "@/components/composed/community/CommunityNavList";
import { SearchButton } from "@/components/atomic";
import { fragment as SearchButtonFragment } from "@/components/atomic/SearchButton/SearchButton";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";
import {
  ActiveCommunityFragment,
  type ActiveCommunityRef,
} from "@/components/global/graphql";
import { useFragment, type FragmentType } from "@/lib/api/gql";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

type Props = {
  searchData?: FragmentType<typeof SearchButtonFragment> | null;
  globalData?: IslandProviderProps["globalData"];
  community?: ActiveCommunityRef;
  // The current route's community-page slug, for the nav's active-page state.
  pageSlug?: string;
};

export default function HeaderNavIsland({
  searchData,
  globalData,
  community,
  pageSlug,
}: Props) {
  const activeCommunity = useFragment(ActiveCommunityFragment, community);
  return (
    <GlobalIslandProviders globalData={globalData}>
      <CommunityNavList condensed data={activeCommunity} pageSlug={pageSlug} />
      <SearchButton size="sm" data={searchData} />
    </GlobalIslandProviders>
  );
}
