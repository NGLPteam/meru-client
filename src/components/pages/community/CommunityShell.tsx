"use client";

import { useFragment, type FragmentType } from "@/lib/api/gql";
import useViewerContext from "@/contexts/useViewerContext";
import UnauthorizedMessage from "@/components/composed/UnauthorizedMessage";
import CommunityNavBar from "@/components/composed/community/CommunityNavBar";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import { communityShellFragment } from "../../../lib/queries/community";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  data: FragmentType<typeof communityShellFragment>;
}>;

export default function CommunityShell({ data, children }: Props) {
  const shell = useFragment(communityShellFragment, data);
  const { isPreview } = useViewerContext();

  // Preview gate: an entity the viewer can't preview shows the unauthorized
  // message in place instead of its draft content. No-op outside preview.
  if (isPreview && !shell.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="community" />;
  }

  const showNavBar =
    shell.layouts?.hero?.template?.definition?.enableDescendantBrowsing;

  return (
    <>
      {showNavBar && <CommunityNavBar data={shell} entityData={shell} />}
      <ProcessingCheck data={shell.layouts} entityType="community">
        {shell.layouts.hero && <HeroTemplate data={shell.layouts.hero} />}
        {children}
      </ProcessingCheck>
    </>
  );
}
