import { Chart } from "react-google-charts";
import {
  ReactGoogleChartProps,
  ChartWrapperOptions,
} from "react-google-charts";
// helpers.cjs is CommonJS; import the default (module.exports) and destructure
// so the browser ESM bundle (Vite) resolves it — a named import only works
// under webpack, not Vite's on-the-fly CJS interop.
import helpers from "@/styles/helpers.cjs";
import { useTheme } from "@/contexts/ThemeProvider";
import { GOOGLE_MAPS_KEY as MAPS_KEY } from "@/lib/env/clientConfig";

const { colors } = helpers;

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
