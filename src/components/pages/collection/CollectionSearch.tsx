"use client";

// Hydrated island: scoped collection search (/collections/[slug]/search).
import SearchLayout from "@/components/composed/search/SearchLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { collectionSearchQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionSearchQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
};

export default function CollectionSearch({
  collection,
  slug,
  globalData,
  route,
  viewer,
}: Props) {
  return (
    <AppProviders
      community={collection.community}
      globalData={globalData}
      route={route}
      viewer={viewer}
    >
      <CollectionShell data={collection} slug={slug}>
        <SearchLayout data={collection} scoped />
      </CollectionShell>
    </AppProviders>
  );
}
