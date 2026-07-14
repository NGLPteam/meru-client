import { Chart } from "react-google-charts";
import {
  ReactGoogleChartProps,
  ChartWrapperOptions,
} from "react-google-charts";
// Import the palette from JSON, not helpers.cjs: Vite serves that .cjs raw
// (top-level require + module.exports), so it exposes no ESM export to the
// browser bundle. JSON imports work in both webpack and Vite.
import colors from "@/styles/colors.json";
import { useTheme } from "@/contexts/ThemeProvider";
import { GOOGLE_MAPS_KEY as MAPS_KEY } from "@/lib/env/clientConfig";

type Props = Partial<ReactGoogleChartProps> & Partial<ChartWrapperOptions>;

export default function GeoChart({
  region,
  data,
  displayMode = "regions",
  legend = "none",
}: Props) {
  const { color: colorName } = useTheme();

  const color = (colorName as "blue" | "cream" | "gray") ?? "cream";

  const chartOptions = {
    region,
    displayMode,
    resolution: region === "US" ? "provinces" : "countries",
    legend,
    datalessRegionColor: "#FFFFFF",
    defaultColor: "#FFFFFF",
    backgroundColor: colors.custom[`${color}`][10],
    colorAxis: {
      minValue: 1,
      colors: [colors.custom[`${color}`][20], colors.custom[`${color}`][70]],
    },
    magnifyingGlass: { enable: false },
    tooltip: {
      textStyle: {
        color: colors.custom[`${color}`][70],
        fontName: "var(--font-face-base)",
      },
    },
  };

  return (
    <Chart
      chartType="GeoChart"
      options={chartOptions}
      width="100%"
      data={data}
      chartVersion="current"
      {...(MAPS_KEY && {
        mapsApiKey: MAPS_KEY,
      })}
    />
  );
}
