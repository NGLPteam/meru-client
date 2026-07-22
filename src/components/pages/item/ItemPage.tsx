"use client";

// Hydrated island: a named item sub-page (/items/[slug]/page/[page]).
import EntityPageLayout from "@/components/composed/entity/EntityPageLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import ItemShell from "./ItemShell";
import type { itemPageQuery } from "../../../lib/queries/item";

type Item = NonNullable<DocumentType<typeof itemPageQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function ItemPage({
  item,
  slug,
  globalData,
  route,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={item.community}
      globalData={globalData}
      route={route}
      draftModeEnabled={draftModeEnabled}
    >
      <ItemShell data={item} slug={slug}>
        <EntityPageLayout data={item.page} />
      </ItemShell>
    </AppProviders>
  );
}
