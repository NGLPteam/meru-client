"use client";

// Hydrated island: the item metrics sub-page (/items/[slug]/metrics) — article
// analytics.
import { Suspense } from "react";
import ArticleAnalyticsBlock from "@/components/composed/analytics/ArticleAnalyticsBlock";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../../providers/AppProviders";
import ItemShell from "./ItemShell";
import type { itemMetricsQuery } from "../../../lib/queries/item";

type Item = NonNullable<DocumentType<typeof itemMetricsQuery>["item"]>;

type Props = {
  item: Item;
  slug: string;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
  viewer?: React.ComponentProps<typeof AppProviders>["viewer"];
};

export default function ItemMetrics({
  item,
  slug,
  globalData,
  route,
  viewer,
}: Props) {
  return (
    <AppProviders
      community={item.community}
      globalData={globalData}
      route={route}
      viewer={viewer}
    >
      <ItemShell data={item} slug={slug}>
        <Suspense fallback={<LoadingBlock />}>
          <ArticleAnalyticsBlock data={item} />
        </Suspense>
      </ItemShell>
    </AppProviders>
  );
}
