"use client";

// Cache-safe (no-viewer) islands for the header's native-<dialog> mobile
// menu: the community picker (dialog header), the nav+search body, and the
// installation name (dialog footer). The per-viewer account nav is a separate
// `server:defer` island placed as a sibling in the dialog body — see
// HeaderMobileMenu.astro. Each region is its own island/React root, so each wraps
// itself in GlobalIslandProviders.
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import CommunityNavList from "@/components/composed/community/CommunityNavList";
import InstallationName from "@/components/composed/instance/InstallationName";
import Search from "@/components/forms/Search";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";
import {
  ActiveCommunityFragment,
  type ActiveCommunityRef,
} from "@/components/global/graphql";
import { AppHeaderFragment } from "./graphql";

// Keep in sync with the dialog id in HeaderMobileMenu.astro.
const MENU_ID = "app-header-menu";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

type CommonProps = {
  globalData?: IslandProviderProps["globalData"];
  community?: ActiveCommunityRef;
  // The current route's community-page slug, for the nav's active-page state.
  pageSlug?: string;
};

type WithData = CommonProps & {
  data?: FragmentType<typeof AppHeaderFragment> | null;
};

export function MobilePicker({ data, globalData, community }: WithData) {
  const appData = useFragment(AppHeaderFragment, data);
  const activeCommunity = useFragment(ActiveCommunityFragment, community);
  return (
    <GlobalIslandProviders globalData={globalData}>
      <CommunityPicker data={appData} activeData={activeCommunity} />
    </GlobalIslandProviders>
  );
}

export function MobileNav({ globalData, community, pageSlug }: CommonProps) {
  const activeCommunity = useFragment(ActiveCommunityFragment, community);
  const closeMenu = () => {
    (document.getElementById(MENU_ID) as HTMLDialogElement | null)?.close();
  };
  return (
    <GlobalIslandProviders globalData={globalData}>
      <CommunityNavList mobile data={activeCommunity} pageSlug={pageSlug} />
      <Search id="headerSearch" onSubmit={closeMenu} mobile />
    </GlobalIslandProviders>
  );
}

export function MobileFooter({ data, globalData }: WithData) {
  const appData = useFragment(AppHeaderFragment, data);
  return (
    <GlobalIslandProviders globalData={globalData}>
      <InstallationName data={appData?.globalConfiguration} />
    </GlobalIslandProviders>
  );
}
