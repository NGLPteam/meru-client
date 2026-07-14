"use client";

// Hydrated island: a named collection sub-page (/collections/[slug]/page/[page]).
import EntityPageLayout from "@/components/composed/entity/EntityPageLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { collectionPageQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionPageQuery>["collection"]
>;

type Props = {
  collection: Collection;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
};

export default function CollectionPage({
  collection,
  slug,
  globalData,
  route,
}: Props) {
  return (
    <AppProviders
      community={collection.community}
      globalData={globalData}
      route={route}
    >
      <CollectionShell data={collection} slug={slug}>
        <EntityPageLayout data={collection.page} />
      </CollectionShell>
    </AppProviders>
  );
}
