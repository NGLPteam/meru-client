"use client";

// Hydrated island for the metrics sub-route: the analytics block runs its own
// client-side urql queries (range/precision/region refetches) and renders
// Google Charts. Theme arrives as a scalar prop — the only ThemeProvider
// consumer left in page bodies is the chart family.
import "@/i18n";
import { Suspense, type ComponentProps } from "react";
import ArticleAnalyticsBlock from "@/components/composed/analytics/ArticleAnalyticsBlock";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import ThemeProvider from "@/contexts/ThemeProvider";

type Props = {
  data: ComponentProps<typeof ArticleAnalyticsBlock>["data"];
  theme?: ComponentProps<typeof ThemeProvider>["theme"];
};

export default function ItemMetricsIsland({ data, theme }: Props) {
  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<LoadingBlock />}>
        <ArticleAnalyticsBlock data={data} />
      </Suspense>
    </ThemeProvider>
  );
}
