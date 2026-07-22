"use client";

// Cache-safe (no-viewer) leaf islands for the header's native-<dialog> mobile
// menu: the community picker (dialog header), the nav+search body, and the
// installation name (dialog footer). The per-viewer account nav is a separate
// `server:defer` island placed as a sibling in the dialog body — see
// HeaderMobileMenu.astro. Each region is its own island/React root, so each wraps
// itself in ChromeLeafProviders.
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import CommunityNavList from "@/components/composed/community/CommunityNavList";
import InstallationName from "@/components/composed/instance/InstallationName";
import Search from "@/components/forms/Search";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import ChromeLeafProviders from "@/components/chrome/ChromeLeafProviders";
import { AppHeaderFragment } from "./graphql";

// Keep in sync with the dialog id in HeaderMobileMenu.astro.
const MENU_ID = "app-header-menu";

type LeafProviderProps = React.ComponentProps<typeof ChromeLeafProviders>;

type CommonProps = {
  globalData?: LeafProviderProps["globalData"];
  community?: LeafProviderProps["community"];
  route?: LeafProviderProps["route"];
};

type WithData = CommonProps & {
  data?: FragmentType<typeof AppHeaderFragment> | null;
};

export function MobilePicker({ data, globalData, community, route }: WithData) {
  const appData = useFragment(AppHeaderFragment, data);
  return (
    <ChromeLeafProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <CommunityPicker data={appData} />
    </ChromeLeafProviders>
  );
}

export function MobileNav({ globalData, community, route }: CommonProps) {
  const closeMenu = () => {
    (document.getElementById(MENU_ID) as HTMLDialogElement | null)?.close();
  };
  return (
    <ChromeLeafProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <CommunityNavList mobile />
      <Search id="headerSearch" onSubmit={closeMenu} mobile />
    </ChromeLeafProviders>
  );
}

export function MobileFooter({ data, globalData, community, route }: WithData) {
  const appData = useFragment(AppHeaderFragment, data);
  return (
    <ChromeLeafProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <InstallationName data={appData?.globalConfiguration} />
    </ChromeLeafProviders>
  );
}
