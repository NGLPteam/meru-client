import { useState, useMemo, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { graphql, useFragment } from "react-relay";
import useIsMounted from "@/hooks/useIsMounted";
import { LoadingBlock } from "@/components/atomic";
import { AssetPDFPreviewFragment$key } from "@/relay/AssetPDFPreviewFragment.graphql";
import AssetPDFPage from "../AssetPDFPage";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function AssetPDFPreview({ data }: Props) {
  const pdf = useFragment(fragment, data);

  const [numPages, setNumPages] = useState<number | null>(null);

  const file = useMemo(() => pdf?.downloadUrl, [pdf]);

  const isMounted = useIsMounted();

  const onLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    [setNumPages],
  );

  return isMounted && file ? (
    <Document
      file={file}
      onLoadSuccess={onLoadSuccess}
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
  data?: AssetPDFPreviewFragment$key | null;
};

const fragment = graphql`
  fragment AssetPDFPreviewFragment on Asset {
    ... on AssetPDF {
      downloadUrl
    }
  }
`;
