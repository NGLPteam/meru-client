"use client";

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
