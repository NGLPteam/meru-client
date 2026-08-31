"use client";

// GoogleScholarMetaTags is intentionally omitted: those <meta> tags are
// rendered into the Astro <head> server-side rather than relying on React 19
// head-hoisting from inside an island.
import { useFragment, type FragmentType } from "@/lib/api/gql";
import useViewerContext from "@/contexts/useViewerContext";
import UnauthorizedMessage from "@/components/composed/UnauthorizedMessage";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import FullTextCheck from "@/components/templates/FullTextCheck";
import NavigationTemplate from "@/components/templates/EntityNavigation";
import ViewCounter from "@/components/composed/analytics/ViewCounter";
import EntityNavBar from "@/components/composed/entity/EntityNavBar";
import { itemLayoutFragment } from "../../../lib/queries/item";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  data: FragmentType<typeof itemLayoutFragment>;
  slug: string;
}>;

export default function ItemShell({ data, slug, children }: Props) {
  const layout = useFragment(itemLayoutFragment, data);
  const { isPreview } = useViewerContext();

  // In preview/draft mode, an entity the viewer isn't allowed to preview shows
  // the unauthorized message in place (keeping the entity URL + chrome) rather
  // than its draft content. Outside preview this never fires (public content).
  if (isPreview && !layout.canPreview?.value) {
    return <UnauthorizedMessage reason="forbidden" entity="item" />;
  }

  const { hero, navigation } = layout.layouts ?? {};

  return (
    <>
      {hero && <HeroTemplate data={hero} />}
      <ProcessingCheck data={layout.layouts} entityType="item">
        {slug && <ViewCounter slug={slug} />}
        <EntityNavBar data={layout} />
        <FullTextCheck data={layout.layouts}>
          <NavigationTemplate data={navigation} />
          {children}
        </FullTextCheck>
      </ProcessingCheck>
    </>
  );
}
