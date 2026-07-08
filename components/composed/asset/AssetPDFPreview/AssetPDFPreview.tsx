"use client";

import "@/lib/pdfsupport";
import { useState, useMemo, useCallback } from "react";
import { Document, Page } from "react-pdf";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import useIsMounted from "@/hooks/useIsMounted";
import { LoadingBlock } from "@/components/atomic";
import AssetPDFPage from "../AssetPDFPage";

export default function AssetPDFPreview({ data }: Props) {
  const pdf = useFragment(fragment, data);

  const [numPages, setNumPages] = useState<number | null>(null);

  const file = useMemo(
    () => (pdf && "downloadUrl" in pdf ? pdf.downloadUrl : undefined),
    [pdf],
  );

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
  data?: FragmentType<typeof fragment> | null;
};

const fragment = graphql(`
  fragment AssetPDFPreviewFragment on Asset {
    __typename
    ... on AssetPDF {
      downloadUrl
    }
  }
`);
