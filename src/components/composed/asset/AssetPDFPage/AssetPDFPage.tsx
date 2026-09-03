import React from "react";
import styles from "./AssetPDFPage.module.css";

export default function AssetInlinePDFPage({
  pageNumber,
  pageLabel,
  children,
}: Props) {
  return (
    <>
      <div className={styles.page}>{children}</div>
      {pageNumber && (
        <div className={styles.pageNumber}>
          {pageLabel
            ? pageLabel.replace("{number}", String(pageNumber))
            : pageNumber}
        </div>
      )}
    </>
  );
}

interface Props {
  /** Children, ie Page component */
  children: React.ReactNode;
  /** Page number */
  pageNumber?: number;
  /** Translated page-number template containing "{number}" */
  pageLabel?: string;
}
