"use client";

import MetadataTemplate from "@/components/templates/Metadata";
import MainLayout from "@/components/templates/MainLayout";
import { FullTextFallback } from "@/components/templates/FullTextCheck/FullTextCheck";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "@/components/providers/AppProviders";
import type { itemMetadataQuery } from "@/lib/queries/item";
import ItemShell from "./ItemShell";

type Item = NonNullable<DocumentType<typeof itemMetadataQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function ItemMetadata({
  item,
  slug,
  globalData,
  route,
  draftModeEnabled,
}: Props) {
  const { metadata, main } = item.layouts;
  const template = metadata?.template;

  return (
    <AppProviders
      community={item.community}
      globalData={globalData}
      route={route}
      draftModeEnabled={draftModeEnabled}
    >
      <ItemShell data={item} slug={slug}>
        {template ? (
          <>
            <MetadataTemplate data={template} />
            <FullTextFallback>
              <MainLayout data={main} fallback />
            </FullTextFallback>
          </>
        ) : null}
      </ItemShell>
    </AppProviders>
  );
}
