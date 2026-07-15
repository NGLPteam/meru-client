"use client";

// Hydrated island: browse a collection ordering (/collections/[slug]/browse/[ordering]).
import EntityOrderingLayout from "@/components/composed/entity/EntityOrderingLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { ComponentProps } from "react";
import type { collectionBrowseQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionBrowseQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  showContext?: ComponentProps<typeof EntityOrderingLayout>["showContext"];
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<typeof AppProviders>["draftModeEnabled"];
};

export default function CollectionBrowse({
  collection,
  slug,
  showContext,
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
        <EntityOrderingLayout
          data={collection.ordering}
          showContext={showContext}
        />
      </CollectionShell>
    </AppProviders>
  );
}
