"use client";

import "@/lib/pdfsupport";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import AssetPDFPage from "../AssetPDFPage";

export default function AssetPDFPreview({ url }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null);

  return url ? (
    <Document
      file={url}
      onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      loading={<LoadingBlock />}
      onLoadError={(err) => console.info(err.message)}
    >
      {numPages && (
        <AssetPDFPage>
          <Page pageNumber={1} width={1159} />
        </AssetPDFPage>
      )}
    </Document>
  ) : null;
}

type Props = {
  url?: string | null;
};
