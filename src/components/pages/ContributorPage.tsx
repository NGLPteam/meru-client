"use client";

// Hydrated island: contributor detail (/contributors/[slug]). Optional item/
// collection breadcrumb nav + the contributor detail (which paginates via
// client-side urql). The scoping entity's parent community feeds the header.
import ContributorDetail from "@/components/composed/contributor/ContributorDetail";
import ContributorDetailNav from "@/components/composed/contributor/ContributorDetailNav";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../providers/AppProviders";

type Props = {
  contributor: React.ComponentProps<typeof ContributorDetail>["data"];
  navData?: React.ComponentProps<typeof ContributorDetailNav>["data"] | null;
  community?: React.ComponentProps<typeof AppProviders>["community"];
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
};

export default function ContributorPage({
  contributor,
  navData,
  community,
  globalData,
  route,
}: Props) {
  return (
    <AppProviders
      community={community}
      globalData={globalData}
      route={route}
    >
      {navData && <ContributorDetailNav data={navData} />}
      <ContributorDetail data={contributor} />
    </AppProviders>
  );
}
