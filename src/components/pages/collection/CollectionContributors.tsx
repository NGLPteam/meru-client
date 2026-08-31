"use client";

import CollectionContributionsBlock from "@/components/composed/contribution/ContributionsBlock/CollectionContributionsBlock";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import CollectionShell from "./CollectionShell";
import type { collectionContributorsQuery } from "../../../lib/queries/collection";

type Collection = NonNullable<
  DocumentType<typeof collectionContributorsQuery>["collection"]
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

export default function CollectionContributors({
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
        <CollectionContributionsBlock
          data={collection}
          slug={slug}
          background="neutral00"
        />
      </CollectionShell>
    </AppProviders>
  );
}
