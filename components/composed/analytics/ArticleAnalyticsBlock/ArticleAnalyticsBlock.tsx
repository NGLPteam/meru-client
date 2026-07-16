"use client";

import { useState, useReducer } from "react";
import { useQuery } from "urql";
import clientOnly from "@/lib/clientOnly";
import UrqlProvider from "@/lib/api/UrqlProvider";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import type { AnalyticsPrecision } from "@/types/graphql-schema";
import ChartControls from "../ChartControls";
import StatBlocks from "../StatBlocks";
import { chartSettingsReducer } from "./settingsReducer";
import styles from "./ArticleAnalyticsBlock.module.css";

type Props = {
  data: FragmentType<typeof fragment>;
};

const ChartBlock = clientOnly(() => import("../ChartBlock"));

// Provides its own (anonymous) urql client — analytics widgets are the only
// client-side GraphQL left.
export default function ArticleAnalyticsBlock(props: Props) {
  return (
    <UrqlProvider>
      <ArticleAnalyticsBlockInner {...props} />
    </UrqlProvider>
  );
}

function ArticleAnalyticsBlockInner({ data }: Props) {
  const base = useFragment(fragment, data);
  const id = base?.id;

  const [mode, setMode] = useState("views");

  const [settings, dispatchSettingsUpdate] = useReducer(chartSettingsReducer, {
    chartType: "map",
    precision: "YEAR" as AnalyticsPrecision,
    dateLabel: "all",
    usOnly: false,
    minDate: null,
    updated: false,
  });

  // Analytics is always fetched client-side (views/downloads must not be
  // counted for server fetches). Refetch whenever the selected range/precision/
  // region change. `settings.dateRange` is undefined for "all time".
  const [result] = useQuery({
    query: analyticsQuery,
    variables: {
      id: id ?? "",
      dateRange: settings.dateRange ?? {},
      precision: settings.precision,
      usOnly: settings.usOnly,
    },
    pause: !id,
  });

  const refetched = useFragment(
    fragment,
    result.data?.node?.__typename
      ? (result.data.node as FragmentType<typeof fragment>)
      : null,
  );

  const chartData = refetched ?? base;
  const isPending = result.fetching;

  const region = settings.usOnly ? "US" : "world";

  return chartData?.viewsByDate ? (
    <div className="l-container-wide">
      <div className={styles.block}>
        <ChartControls
          setMode={setMode}
          mode={mode}
          region={region}
          chartType={settings.chartType}
          dispatchSettingsUpdate={dispatchSettingsUpdate}
          dateLabel={settings.dateLabel}
        />
        {isPending ? (
          <div className={styles.loading}>
            <LoadingBlock />
          </div>
        ) : (
          <ChartBlock
            data={chartData}
            chartType={settings.chartType}
            region={region}
            mode={mode}
            precision={settings.precision}
          />
        )}
        <StatBlocks
          data={chartData}
          region={region}
          mode={mode}
          dateLabel={settings.dateLabel}
        />
      </div>
    </div>
  ) : null;
}

export const fragment = graphql(`
  fragment ArticleAnalyticsBlockFragment on Item {
    id
    downloadsByDate: assetDownloads(
      dateFilter: $dateRange
      precision: $precision
    ) {
      total
      unfilteredTotal
      minDate
      results {
        count
        date
      }
    }
    assetDownloadsByRegion(dateFilter: $dateRange, usOnly: $usOnly) {
      total
      results {
        countryCode
        regionCode
        count
      }
    }
    viewsByDate: entityViews(dateFilter: $dateRange, precision: $precision) {
      total
      unfilteredTotal
      minDate
      results {
        count
        date
      }
    }
    entityViewsByRegion(dateFilter: $dateRange, usOnly: $usOnly) {
      total
      results {
        countryCode
        regionCode
        count
      }
    }
  }
`);

const analyticsQuery = graphql(`
  query ArticleAnalyticsBlockQuery(
    $id: ID!
    $dateRange: DateFilterInput
    $precision: AnalyticsPrecision
    $usOnly: Boolean
  ) {
    node(id: $id) {
      __typename
      ...ArticleAnalyticsBlockFragment
    }
  }
`);
