"use client";

import EntityPageLayout from "@/components/composed/entity/EntityPageLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "@/components/providers/AppProviders";
import type { collectionPageQuery } from "@/lib/queries/collection";
import CollectionShell from "./CollectionShell";

type Collection = NonNullable<
  DocumentType<typeof collectionPageQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function CollectionPage({
  collection,
  slug,
  globalData,
  route,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={collection.community}
      globalData={globalData}
      route={route}
      draftModeEnabled={draftModeEnabled}
    >
      <CollectionShell data={collection} slug={slug}>
        <EntityPageLayout data={collection.page} />
      </CollectionShell>
    </AppProviders>
  );
}
