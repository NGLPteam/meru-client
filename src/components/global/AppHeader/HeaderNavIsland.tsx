"use client";

// Right header cluster (desktop): community nav list + search button. A
// cache-safe leaf island (no viewer) wrapped in ChromeLeafProviders. Rendered
// only off community-root/home/search — that gating happens in AppHeader.astro.
import CommunityNavList from "@/components/composed/community/CommunityNavList";
import { SearchButton } from "@/components/atomic";
import { fragment as SearchButtonFragment } from "@/components/atomic/SearchButton/SearchButton";
import ChromeLeafProviders from "@/components/chrome/ChromeLeafProviders";
import type { FragmentType } from "@/lib/api/gql";

type LeafProviderProps = React.ComponentProps<typeof ChromeLeafProviders>;

type Props = {
  searchData?: FragmentType<typeof SearchButtonFragment> | null;
  globalData?: LeafProviderProps["globalData"];
  community?: LeafProviderProps["community"];
  route?: LeafProviderProps["route"];
};

export default function HeaderNavIsland({
  searchData,
  globalData,
  community,
  route,
}: Props) {
  return (
    <ChromeLeafProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <CommunityNavList condensed />
      <SearchButton size="sm" data={searchData} />
    </ChromeLeafProviders>
  );
}
