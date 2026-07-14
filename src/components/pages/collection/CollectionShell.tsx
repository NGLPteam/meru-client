"use client";

// The shared collection chrome (hero + view counter + entity nav bar + processing
// check) that wraps every collection route's content — the React equivalent of
// the Next collection layout.tsx. Unmasks CollectionLayoutFragment; the parent
// community for the header context is provided separately (AppProviders).
import { useFragment, type FragmentType } from "@/lib/api/gql";
import HeroTemplate from "@/components/templates/Hero";
import ProcessingCheck from "@/components/templates/ProcessingCheck";
import ViewCounter from "@/components/composed/analytics/ViewCounter";
import EntityNavBar from "@/components/composed/entity/EntityNavBar";
import { collectionLayoutFragment } from "../../../lib/queries/collection";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  data: FragmentType<typeof collectionLayoutFragment>;
  slug: string;
}>;

export default function CollectionShell({ data, slug, children }: Props) {
  const layout = useFragment(collectionLayoutFragment, data);

  return (
    <>
      {layout.layouts.hero && <HeroTemplate data={layout.layouts.hero} />}
      <ProcessingCheck data={layout.layouts} entityType="collection">
        {slug && <ViewCounter slug={slug} />}
        <EntityNavBar data={layout} />
        {children}
      </ProcessingCheck>
    </>
  );
}
