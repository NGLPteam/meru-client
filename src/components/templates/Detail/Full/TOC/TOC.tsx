import { useTranslation } from "react-i18next";
import classNames from "classnames";
import styles from "./TOC.module.css";

// Static markup only; the <table-of-contents> custom element (defined in
// src/components/client/) scans the prose marked
// data-toc-source within the shared data-toc-scope ancestor, assigns heading
// ids, fills the list, and unhides the block.
export default function TOC() {
  const { t } = useTranslation();

  return (
    <table-of-contents
      hidden
      className={styles.toc}
      data-item-class={styles["toc__item"]}
    >
      <div className={styles["toc__inner"]}>
        <h3
          className={classNames(
            "t-label-sm t-copy-light",
            styles["toc__header"],
          )}
        >
          {t("glossary.table_of_contents")}
        </h3>
        <ul className={styles["toc__list"]} data-toc-list />
      </div>
    </table-of-contents>
  );
}
