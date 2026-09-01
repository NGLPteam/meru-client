"use client";

import EntityAnnouncementLayout from "@/components/composed/entity/EntityAnnouncementLayout";
import AppProviders from "@/components/providers/AppProviders";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import type { collectionAnnouncementQuery } from "@/lib/queries/collection";
import CollectionShell from "./CollectionShell";

type Collection = NonNullable<
  DocumentType<typeof collectionAnnouncementQuery>["collection"]
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

export default function CollectionAnnouncement({
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
        <EntityAnnouncementLayout data={collection.announcement} />
      </CollectionShell>
    </AppProviders>
  );
}
