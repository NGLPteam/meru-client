"use client";

// Hydrated island: a collection announcement
// (/collections/[slug]/announcements/[announcement]).
import EntityAnnouncementLayout from "@/components/composed/entity/EntityAnnouncementLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { collectionAnnouncementQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionAnnouncementQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<typeof AppProviders>["draftModeEnabled"];
};

export default function CollectionAnnouncement({
  collection,
  slug,
  globalData,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={collection.community}
      globalData={globalData}
      route={route}
      viewer={viewer}
      draftModeEnabled={draftModeEnabled}
    >
      <CollectionShell data={collection} slug={slug}>
        <EntityAnnouncementLayout data={collection.announcement} />
      </CollectionShell>
    </AppProviders>
  );
}
