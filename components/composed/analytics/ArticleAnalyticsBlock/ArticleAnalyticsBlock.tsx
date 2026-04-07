"use client";

import {
  useState,
  useReducer,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import {
  graphql,
  useRefetchableFragment,
  useRelayEnvironment,
  commitLocalUpdate,
} from "react-relay";
import dynamic from "next/dynamic";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import { ArticleAnalyticsBlockFragment$key } from "@/relay/ArticleAnalyticsBlockFragment.graphql";
import {
  ArticleAnalyticsBlockQuery,
  ArticleAnalyticsBlockQuery$variables,
} from "@/relay/ArticleAnalyticsBlockQuery.graphql";
import type { AnalyticsPrecision } from "@/types/graphql-schema";
import ChartControls from "../ChartControls";
import StatBlocks from "../StatBlocks";
import { chartSettingsReducer } from "./settingsReducer";
import styles from "./ArticleAnalyticsBlock.module.css";

type Props = {
  data: ArticleAnalyticsBlockFragment$key;
};

const ChartBlock = dynamic(() => import("../ChartBlock"), { ssr: false });

export default function ArticleAnalyticsBlock({ data }: Props) {
  const [chartData, refetch] = useRefetchableFragment<
    ArticleAnalyticsBlockQuery,
    ArticleAnalyticsBlockFragment$key
  >(fragment, data);

  const [mode, setMode] = useState("views");

  const minDate =
    mode === "views"
      ? chartData.viewsByDate.minDate
      : chartData.downloadsByDate.minDate;

  const initalSettings = {
    chartType: "map",
    precision: "YEAR" as AnalyticsPrecision,
    dateLabel: "all",
    usOnly: false,
    minDate: minDate ?? null,
    updated: false,
  };

  const environment = useRelayEnvironment();

  const [isPending, startTransition] = useTransition();

  const doRefetch = useCallback(
    (queryVars: Omit<ArticleAnalyticsBlockQuery$variables, "id">) => {
      startTransition(() => {
        refetch(queryVars);
        return;
      });
    },
    [startTransition, refetch],
  );

  const [settings, dispatchSettingsUpdate] = useReducer(
    chartSettingsReducer,
    initalSettings,
  );

  useEffect(() => {
    doRefetch(settings);
  }, [doRefetch, settings]);

  useEffect(() => {
    const viewsTotal = chartData.viewsByDate.unfilteredTotal;
    const downloadsTotal = chartData.downloadsByDate.unfilteredTotal;

    commitLocalUpdate(environment, (store) => {
      const itemRecord = store.get(chartData.id);
      if (!itemRecord) return;

      const entityViews = itemRecord.getLinkedRecord("entityViews");
      if (entityViews) {
        entityViews.setValue(viewsTotal, "total");
      }

      const assetDownloads = itemRecord.getLinkedRecord("assetDownloads");
      if (assetDownloads) {
        assetDownloads.setValue(downloadsTotal, "total");
      }
    });
  }, [
    environment,
    chartData.id,
    chartData.viewsByDate.unfilteredTotal,
    chartData.downloadsByDate.unfilteredTotal,
  ]);

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

const fragment = graphql`
  fragment ArticleAnalyticsBlockFragment on Item
  @refetchable(queryName: "ArticleAnalyticsBlockQuery")
  @argumentDefinitions(
    dateRange: { type: "DateFilterInput", defaultValue: {} }
    precision: { type: "AnalyticsPrecision", defaultValue: YEAR }
    usOnly: { type: "Boolean", defaultValue: false }
  ) {
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
`;
