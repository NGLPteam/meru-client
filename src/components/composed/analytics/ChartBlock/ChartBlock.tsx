import classNames from "classnames";
import { useCallback } from "react";
import { format, parseISO } from "date-fns";
import useIsMounted from "@/hooks/useIsMounted";
import { fragment as ArticleAnalyticsBlockFragment } from "@/components/composed/analytics/ArticleAnalyticsBlock/ArticleAnalyticsBlock";
import { type DocumentType } from "@/lib/api/gql";
import GeoChart from "../GeoChart";
import LineColChart from "../LineColChart";
import styles from "./ChartBlock.module.css";

type Props = {
  data: DocumentType<typeof ArticleAnalyticsBlockFragment>;
  chartType: string;
  region: string;
  mode: string;
  precision: string;
  themeColor?: string;
};

export default function ChartBlock({
  data,
  chartType,
  region,
  mode,
  precision,
  themeColor,
}: Props) {
  const formatMapData = useCallback(
    (data: DocumentType<typeof ArticleAnalyticsBlockFragment>) => {
      const subset =
        mode === "views"
          ? data.entityViewsByRegion?.results
          : data.assetDownloadsByRegion?.results;

      if (region === "US") {
        return [
          ["state", "count"],
          ...subset.map(({ count, regionCode }) => [`US-${regionCode}`, count]),
        ];
      }

      const aggregated = subset?.reduce(
        (obj: { [key: string]: number }, region) => {
          const { count, countryCode } = region;
          if (countryCode === "$unknown$") {
            return obj;
          } else if (Object.keys(obj).includes(countryCode)) {
            obj[countryCode] = obj[countryCode] + count;
            return obj;
          }
          obj[countryCode] = count;
          return obj;
        },
        {},
      );

      return [
        ["country", "count"],
        ...Object.keys(aggregated ?? {}).map((country) => [
          country,
          aggregated[country],
        ]),
      ];
    },
    [mode, region],
  );

  const formatLineChartData = useCallback(
    (data: DocumentType<typeof ArticleAnalyticsBlockFragment>) => {
      const subset =
        mode === "views"
          ? data.viewsByDate.results
          : data.downloadsByDate.results;

      const formatDateLabel = (date: Date) => {
        switch (precision) {
          case "DAY":
            return format(date, "LLL d");
          case "MONTH":
            return format(date, "LLL y");
          case "YEAR":
            return format(date, "y");
        }
      };

      return [
        ["date", "count"],
        ...subset.map(({ count, date }) => [
          formatDateLabel(parseISO(date)),
          count,
        ]),
      ];
    },
    [mode, precision],
  );

  const isMounted = useIsMounted();

  return isMounted && data ? (
    <div
      className={classNames(styles.wrapper, {
        [styles["wrapper--chart"]]: chartType !== "map",
      })}
    >
      {chartType === "map" ? (
        <GeoChart
          data={formatMapData(data)}
          region={region}
          themeColor={themeColor}
        />
      ) : (
        <LineColChart
          data={formatLineChartData(data)}
          themeColor={themeColor}
        />
      )}
    </div>
  ) : null;
}
