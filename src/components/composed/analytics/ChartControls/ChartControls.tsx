import classNames from "classnames";
import { useTranslation } from "react-i18next";
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
};

export default function ChartControls({
  region,
  setMode,
  mode,
  chartType,
  dateLabel,
  dispatchSettingsUpdate,
}: Props) {
  const { t } = useTranslation();

  const regions = [
    { label: "analytics.regions.world", value: "world" },
    { label: "analytics.regions.united_states", value: "US" },
  ];
  const dateRanges = [
    { label: "analytics.date_ranges.all", value: "all" },
    { label: "analytics.date_ranges.week", value: "week" },
    { label: "analytics.date_ranges.month", value: "month" },
    { label: "analytics.date_ranges.year", value: "year" },
  ];

  return (
    <div className={styles.wrapper}>
      <Switch
        options={[
          { label: "analytics.views", value: "views" },
          { label: "analytics.downloads", value: "downloads" },
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
          <DateRangeDisclosure active={dateLabel} />
        </button>
        <div
          id={MENU_ID}
          className={dropdownStyles.panel}
          data-placement="bottom-end"
          aria-label={t("analytics.date_ranges.dropdown_label")}
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
                    <span className={styles.linkText}>
                      {t(dateRange.label)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </disclosure-menu>
      <Switch
        options={[
          { label: "analytics.map", value: "map" },
          { label: "analytics.chart", value: "chart" },
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
