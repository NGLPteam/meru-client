"use client";

// Hydrated island: the global header (logo, community picker, search, account
// menu, mobile drawer) plus the skip link. Wraps AppHeader — unchanged Meru
// component — in the chrome provider stack, fed server data via props.
import { useTranslation } from "react-i18next";
import AppHeader from "@/components/global/AppHeader";
import SkipLink from "@/components/global/SkipLink";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import ChromeProviders from "./ChromeProviders";

type Props = {
  data?: React.ComponentProps<typeof AppHeader>["data"];
  searchData?: React.ComponentProps<typeof AppHeader>["searchData"];
  globalData?: GlobalStaticData;
  community?: React.ComponentProps<typeof ChromeProviders>["community"];
  route?: React.ComponentProps<typeof ChromeProviders>["route"];
  viewer?: React.ComponentProps<typeof ChromeProviders>["viewer"];
  draftModeEnabled?: boolean;
};

function SkipLinkWithLabel() {
  const { t } = useTranslation();
  return <SkipLink toId="main" label={t("nav.skip_to_content")} />;
}

export default function AppHeaderIsland({
  data,
  searchData,
  globalData,
  community,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  return (
    <ChromeProviders
      globalData={globalData}
      community={community}
      route={route}
      viewer={viewer}
      draftModeEnabled={draftModeEnabled}
    >
      <SkipLinkWithLabel />
      <AppHeader data={data} searchData={searchData} />
    </ChromeProviders>
  );
}
