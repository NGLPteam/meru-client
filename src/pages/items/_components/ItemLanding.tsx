"use client";

// Items without full text never reach this island: the .astro page 302s them
// to /metadata server-side (shouldRenderMainLayout).
import MainLayout from "@/components/templates/MainLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "@/components/providers/AppProviders";
import type { itemQuery } from "@/lib/queries/item";
import ItemShell from "./ItemShell";

type Item = NonNullable<DocumentType<typeof itemQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function ItemLanding({
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
        <MainLayout data={item.layouts.main} />
      </ItemShell>
    </AppProviders>
  );
}
