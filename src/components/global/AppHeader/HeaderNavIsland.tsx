"use client";

// Right header cluster (desktop): community nav list + search button. A
// cache-safe island (no viewer) wrapped in GlobalIslandProviders. Rendered
// only off community-root/home/search — that gating happens in AppHeader.astro.
import CommunityNavList from "@/components/composed/community/CommunityNavList";
import { SearchButton } from "@/components/atomic";
import { fragment as SearchButtonFragment } from "@/components/atomic/SearchButton/SearchButton";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";
import type { FragmentType } from "@/lib/api/gql";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

type Props = {
  searchData?: FragmentType<typeof SearchButtonFragment> | null;
  globalData?: IslandProviderProps["globalData"];
  community?: IslandProviderProps["community"];
  route?: IslandProviderProps["route"];
};

export default function HeaderNavIsland({
  searchData,
  globalData,
  community,
  route,
}: Props) {
  return (
    <GlobalIslandProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <CommunityNavList condensed />
      <SearchButton size="sm" data={searchData} />
    </GlobalIslandProviders>
  );
}
