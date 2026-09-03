"use client";

import { useEffect, useState, useReducer } from "react";
import clientOnly from "@/lib/clientOnly";
import makeUrqlClient from "@/lib/api/makeUrqlClient";
import { getAPIURL } from "@/lib/api/client";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import type { AnalyticsPrecision } from "@/types/graphql-schema";
import ChartControls from "../ChartControls";
import StatBlocks from "../StatBlocks";
import { chartSettingsReducer } from "./settingsReducer";
import styles from "./ArticleAnalyticsBlock.module.css";

type Props = {
  data?: FragmentType<typeof fragment> | null;
  // The instance theme's color name, threaded to the charts (replaces the
  // retired ThemeProvider context).
  themeColor?: string;
  // Translated strings keyed by i18n key, built by the mounting .astro
  // (metrics.astro) — no i18next ships in the island bundle.
  labels: Record<string, string>;
};

const ChartBlock = clientOnly(() => import("../ChartBlock"));

// Anonymous @urql/core client — analytics widgets are the only client-side
// GraphQL left, and they never send auth (public counts only). Lazy so merely
// importing this module doesn't demand an API URL.
let client: ReturnType<typeof makeUrqlClient> | undefined;
const getClient = () =>
  (client ??= makeUrqlClient(getAPIURL(), "network-only"));

export default function ArticleAnalyticsBlock({
  data,
  themeColor,
  labels,
}: Props) {
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
  // region change. `settings.dateRange` is undefined for "all time". Pending
  // state is derived (last-applied key vs. current key) rather than set
  // synchronously inside the effect.
  const variables = {
    id: id ?? "",
    dateRange: settings.dateRange ?? {},
    precision: settings.precision,
    usOnly: settings.usOnly,
  };
  const variablesKey = JSON.stringify(variables);

  const [applied, setApplied] = useState<{
    key: string;
    data: FragmentType<typeof fragment> | null;
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getClient()
      .query(analyticsQuery, JSON.parse(variablesKey))
      .toPromise()
      .then((result) => {
        if (cancelled) return;
        const node = result.data?.node;
        setApplied({
          key: variablesKey,
          data: node?.__typename
            ? (node as FragmentType<typeof fragment>)
            : null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, variablesKey]);

  const isPending = !!id && applied?.key !== variablesKey;

  const refetched = useFragment(fragment, applied?.data ?? null);

  const chartData = refetched ?? base;

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
          labels={labels}
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
            themeColor={themeColor}
          />
        )}
        <StatBlocks
          data={chartData}
          region={region}
          mode={mode}
          dateLabel={settings.dateLabel}
          labels={labels}
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
