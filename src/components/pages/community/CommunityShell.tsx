"use client";

// The shared community chrome (nav bar + hero + processing check) that wraps
// every community route's content — the React equivalent of the Next community
// layout.tsx. Unmasks CommunityLayoutFragment and renders the route-specific
// content as children (inside the processing check, after the hero).
import { useFragment, type FragmentType } from "@/lib/api/gql";
import CommunityNavBar from "@/components/composed/community/CommunityNavBar";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import { communityLayoutFragment } from "../../../lib/queries/community";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  data: FragmentType<typeof communityLayoutFragment>;
}>;

export default function CommunityShell({ data, children }: Props) {
  const layout = useFragment(communityLayoutFragment, data);
  const showNavBar =
    layout.layouts?.hero?.template?.definition?.enableDescendantBrowsing;

  return (
    <>
      {showNavBar && <CommunityNavBar data={layout} entityData={layout} />}
      <ProcessingCheck data={layout.layouts} entityType="community">
        {layout.layouts.hero && <HeroTemplate data={layout.layouts.hero} />}
        {children}
      </ProcessingCheck>
    </>
  );
}
