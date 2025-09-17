import { useTranslation } from "react-i18next";
import IconFactory from "@/components/factories/IconFactory";
import styles from "./DateRangeDisclosure.module.css";
import type { MaybeButtonRef } from "@castiron/common-types";

type Props = {
  active: string;
  ref?: MaybeButtonRef;
};

function DateRangeDisclosure({ active, ref, ...props }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper} {...props}>
      <div className={styles.text}>
        <span className={styles.label}>
          {t("analytics.date_ranges.dropdown_label")}
        </span>
        <span className={styles.selected}>
          {t(`analytics.date_ranges.${active}`)}
        </span>
      </div>
      <IconFactory icon="chevronDown" role="presentation" />
    </div>
  );
}

export default DateRangeDisclosure;
