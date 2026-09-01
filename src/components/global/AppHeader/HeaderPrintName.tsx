"use client";

// Print-only community name (the header's `@media print` block). No viewer, no
// interactivity — rendered statically (no client directive) inside
// GlobalIslandProviders so CommunityName can read the community from context.
import CommunityName from "@/components/composed/community/CommunityName";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

type Props = {
  globalData?: IslandProviderProps["globalData"];
  community?: IslandProviderProps["community"];
  route?: IslandProviderProps["route"];
};

export default function HeaderPrintName({
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
      <CommunityName />
    </GlobalIslandProviders>
  );
}
