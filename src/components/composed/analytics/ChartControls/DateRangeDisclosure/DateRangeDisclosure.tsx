import IconFactory from "@/components/factories/IconFactory";
import styles from "./DateRangeDisclosure.module.css";
import type { MaybeButtonRef } from "@castiron/common-types";

type Props = {
  active: string;
  // Translated strings keyed by i18n key — see metrics.astro.
  labels: Record<string, string>;
  ref?: MaybeButtonRef;
};

function DateRangeDisclosure({ active, labels, ref, ...props }: Props) {
  return (
    <div className={styles.wrapper} {...props}>
      <div className={styles.text}>
        <span className={styles.label}>
          {labels["analytics.date_ranges.dropdown_label"]}
        </span>
        <span className={styles.selected}>
          {labels[`analytics.date_ranges.${active}`]}
        </span>
      </div>
      <IconFactory icon="chevronDown" role="presentation" />
    </div>
  );
}

export default DateRangeDisclosure;
