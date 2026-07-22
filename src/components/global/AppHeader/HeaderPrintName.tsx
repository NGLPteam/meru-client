"use client";

// Print-only community name (the header's `@media print` block). No viewer, no
// interactivity — rendered statically (no client directive) inside ChromeLeafProviders
// so CommunityName can read the community from context.
import CommunityName from "@/components/composed/community/CommunityName";
import ChromeLeafProviders from "@/components/chrome/ChromeLeafProviders";

type LeafProviderProps = React.ComponentProps<typeof ChromeLeafProviders>;

type Props = {
  globalData?: LeafProviderProps["globalData"];
  community?: LeafProviderProps["community"];
  route?: LeafProviderProps["route"];
};

export default function HeaderPrintName({
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
      <CommunityName />
    </ChromeLeafProviders>
  );
}
