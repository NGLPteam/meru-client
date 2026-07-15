"use client";

// Hydrated island: the global footer. Wraps AppFooter — unchanged Meru
// component — in the chrome provider stack, fed server data via props.
import AppFooter from "@/components/global/AppFooter";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import ChromeProviders from "./ChromeProviders";

type Props = {
  data?: React.ComponentProps<typeof AppFooter>["data"];
  communityData?: React.ComponentProps<typeof AppFooter>["communityData"];
  globalData?: GlobalStaticData;
  community?: React.ComponentProps<typeof ChromeProviders>["community"];
  route?: React.ComponentProps<typeof ChromeProviders>["route"];
  viewer?: React.ComponentProps<typeof ChromeProviders>["viewer"];
  draftModeEnabled?: boolean;
};

export default function AppFooterIsland({
  data,
  communityData,
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
      <AppFooter data={data} communityData={communityData} />
    </ChromeProviders>
  );
}
