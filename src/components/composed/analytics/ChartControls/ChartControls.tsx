import classNames from "classnames";
import dropdownStyles from "@/components/atomic/Dropdown/Dropdown.module.css";
import Switch from "./Switch";
import DateRangeDisclosure from "./DateRangeDisclosure";
import styles from "./ChartControls.module.css";

// This React island renders the <disclosure-menu> custom element's markup
// directly (React 19 handles custom elements first-class), so it must ensure
// the element is defined — the page may not include any .astro instance.
// Dynamic import: the class extends HTMLElement, which doesn't exist during
// the island's server render.
if (typeof window !== "undefined" && !customElements.get("disclosure-menu")) {
  import("@/components/client/DisclosureMenu/DisclosureMenu").then(
    ({ default: DisclosureMenuElement }) => {
      if (!customElements.get("disclosure-menu")) {
        customElements.define("disclosure-menu", DisclosureMenuElement);
      }
    },
  );
}

const MENU_ID = "chart-date-range-menu";

type Props = {
  setMode: (val: string) => void;
  mode: string;
  region: string;
  chartType: string;
  dateLabel: string;
  dispatchSettingsUpdate: (args: { type: string; value: string }) => void;
  // Translated strings keyed by i18n key — see metrics.astro.
  labels: Record<string, string>;
};

export default function ChartControls({
  region,
  setMode,
  mode,
  chartType,
  dateLabel,
  dispatchSettingsUpdate,
  labels,
}: Props) {
  const regions = [
    { label: labels["analytics.regions.world"], value: "world" },
    { label: labels["analytics.regions.united_states"], value: "US" },
  ];
  const dateRanges = ["all", "week", "month", "year"].map((value) => ({
    label: labels[`analytics.date_ranges.${value}`],
    value,
  }));

  return (
    <div className={styles.wrapper}>
      <Switch
        options={[
          { label: labels["analytics.views"], value: "views" },
          { label: labels["analytics.downloads"], value: "downloads" },
        ]}
        onClick={setMode}
        active={mode}
      />
      <disclosure-menu className={dropdownStyles.menu}>
        <button
          type="button"
          aria-controls={MENU_ID}
          aria-expanded="false"
          className={dropdownStyles.toggle}
        >
          <DateRangeDisclosure active={dateLabel} labels={labels} />
        </button>
        <div
          id={MENU_ID}
          className={dropdownStyles.panel}
          data-placement="bottom-end"
          aria-label={labels["analytics.date_ranges.dropdown_label"]}
          inert
        >
          <div className={classNames("a-bg-neutral00", dropdownStyles.wrapper)}>
            <ul className={dropdownStyles.list}>
              {dateRanges.map((dateRange) => (
                <li className={dropdownStyles.item} key={dateRange.value}>
                  <button
                    data-close-menu=""
                    onClick={() =>
                      dispatchSettingsUpdate({
                        type: "dateRange",
                        value: dateRange.value,
                      })
                    }
                  >
                    <span className={styles.linkText}>{dateRange.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </disclosure-menu>
      <Switch
        options={[
          { label: labels["analytics.map"], value: "map" },
          { label: labels["analytics.chart"], value: "chart" },
        ]}
        active={chartType}
        onClick={(val) => dispatchSettingsUpdate({ type: "chart", value: val })}
      />
      {chartType === "map" && (
        <Switch
          options={regions}
          active={region}
          onClick={(val) =>
            dispatchSettingsUpdate({ type: "region", value: val })
          }
        />
      )}
    </div>
  );
}
