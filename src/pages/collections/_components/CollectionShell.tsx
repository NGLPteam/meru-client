"use client";

import { useFragment, type FragmentType } from "@/lib/api/gql";
import useViewerContext from "@/contexts/useViewerContext";
import UnauthorizedMessage from "@/components/composed/UnauthorizedMessage";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import ViewCounter from "@/components/composed/analytics/ViewCounter";
import EntityNavBar from "@/components/composed/entity/EntityNavBar";
import { collectionShellFragment } from "@/lib/queries/collection";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  data: FragmentType<typeof collectionShellFragment>;
  slug: string;
}>;

export default function CollectionShell({ data, slug, children }: Props) {
  const shell = useFragment(collectionShellFragment, data);
  const { isPreview } = useViewerContext();

  // Preview gate: an entity the viewer can't preview shows the unauthorized
  // message in place instead of its draft content. No-op outside preview.
  if (isPreview && !shell.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="collection" />;
  }

  return (
    <>
      {shell.layouts.hero && <HeroTemplate data={shell.layouts.hero} />}
      <ProcessingCheck data={shell.layouts} entityType="collection">
        {slug && <ViewCounter slug={slug} />}
        <EntityNavBar data={shell} />
        {children}
      </ProcessingCheck>
    </>
  );
}
