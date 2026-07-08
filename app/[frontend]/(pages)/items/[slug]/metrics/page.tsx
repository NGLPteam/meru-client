import { Suspense } from "react";
import { graphql } from "@/lib/api/gql";
import { notFound } from "next/navigation";
import ArticleAnalyticsBlock from "@/components/composed/analytics/ArticleAnalyticsBlock";
import { AnalyticsPrecision } from "@/types/graphql-schema";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { BasePageParams } from "@/types/page";
import queryApi from "@/lib/api/queryApi";

export async function generateStaticParams() {
  return [];
}

export default async function ItemMetricsPage({ params }: BasePageParams) {
  const { slug } = await params;

  const { data } = await queryApi(query, {
    slug,
    dateRange: {},
    precision: "YEAR" as AnalyticsPrecision,
    usOnly: false,
  });

  const { item } = data ?? {};

  if (!item) return notFound();

  return (
    <Suspense fallback={<LoadingBlock />}>
      <ArticleAnalyticsBlock data={item} />
    </Suspense>
  );
}

const query = graphql(`
  query pageTemplatesItemMetricsQuery(
    $slug: Slug!
    $dateRange: DateFilterInput!
    $precision: AnalyticsPrecision!
    $usOnly: Boolean!
  ) {
    item(slug: $slug) {
      ...ArticleAnalyticsBlockFragment
    }
  }
`);
