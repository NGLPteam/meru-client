"use client";

// Hydrated island: the item contributors sub-page (/items/[slug]/contributors).
import ContributionsBlock from "@/components/composed/contribution/ContributionsBlock";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import ItemShell from "./ItemShell";
import type { itemContributorsQuery } from "../../../lib/queries/item";

type Item = NonNullable<DocumentType<typeof itemContributorsQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<typeof AppProviders>["draftModeEnabled"];
};

export default function ItemContributors({
  item,
  slug,
  globalData,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  return (
    <AppProviders
      community={item.community}
      globalData={globalData}
      route={route}
      viewer={viewer}
      draftModeEnabled={draftModeEnabled}
    >
      <ItemShell data={item} slug={slug}>
        <ContributionsBlock data={item} slug={slug} background="neutral00" />
      </ItemShell>
    </AppProviders>
  );
}
