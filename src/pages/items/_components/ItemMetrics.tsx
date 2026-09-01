"use client";

import { Suspense } from "react";
import ArticleAnalyticsBlock from "@/components/composed/analytics/ArticleAnalyticsBlock";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "@/components/providers/AppProviders";
import type { itemMetricsQuery } from "@/lib/queries/item";
import ItemShell from "./ItemShell";

type Item = NonNullable<DocumentType<typeof itemMetricsQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  draftModeEnabled?: React.ComponentProps<
    typeof AppProviders
  >["draftModeEnabled"];
};

export default function ItemMetrics({
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
        <Suspense fallback={<LoadingBlock />}>
          <ArticleAnalyticsBlock data={item} />
        </Suspense>
      </ItemShell>
    </AppProviders>
  );
}
