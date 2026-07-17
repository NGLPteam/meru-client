"use client";

// Hydrated island: the item detail body (/items/[slug]) — the item shell
// wrapping the main layout. Items without full text never reach this island:
// the .astro page 302s them to /metadata server-side (shouldRenderMainLayout).
// The parent community is threaded through AppProviders for the header context.
import MainLayout from "@/components/templates/MainLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import ItemShell from "./ItemShell";
import type { itemQuery } from "../../../lib/queries/item";

type Item = NonNullable<DocumentType<typeof itemQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function ItemLanding({
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
        <MainLayout data={item.layouts.main} />
      </ItemShell>
    </AppProviders>
  );
}
