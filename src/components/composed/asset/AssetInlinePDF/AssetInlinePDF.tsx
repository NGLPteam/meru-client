"use client";

import "@/lib/pdfsupport";
import { useState, useRef, useCallback } from "react";
import { Document } from "react-pdf";
import refresh from "@/lib/routing/refresh";
import ErrorBlock from "@/components/layout/messages/ErrorBlock";
import NoContent from "@/components/layout/messages/NoContent";
import BackToTopButton from "@/components/atomic/Button/patterns/BackToTopButton";
import LoadingBlock from "@/components/atomic/loading/LoadingBlock";
import AssetInlinePDFNav from "./AssetInlinePDFNav";
import AssetInlinePDFPage from "./AssetInlinePDFPage";
import styles from "./AssetInlinePDF.module.css";

// Translated strings built by the mounting .astro (Detail/Full.astro) — no
// i18next ships in the island bundle. *Template strings carry a literal
// placeholder the island substitutes at render time.
export type AssetInlinePDFLabels = {
  noContent: string;
  cannotBeDisplayedPrefix: string;
  cannotBeDisplayedLink: string;
  cannotBeDisplayedSuffix: string;
  viewFullPdfPrefix: string;
  viewFullPdfLink: string;
  viewFullPdfSuffix: string;
  /** contains "{code}" */
  serverErrorTemplate: string;
  renderError: string;
  errorHeading: string;
  serverErrorHeading: string;
  backToTop: string;
  skipToPdfContent: string;
  /** contains "{number}" */
  pageNumberTemplate: string;
};

type Props = {
  url?: string | null;
  size?: string | null;
  labels: AssetInlinePDFLabels;
};

export default function AssetInlinePDF({ url, size, labels }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [state, setState] = useState<{
    numPages: number;
    error?: Error;
  }>({
    numPages: 0,
    error: undefined,
  });

  const renderError = useCallback(() => {
    const isStatusError = !!state.error && "status" in state.error;
    const message = isStatusError
      ? labels.serverErrorTemplate.replace(
          "{code}",
          String((state.error as Error & { status?: unknown })?.status),
        )
      : labels.renderError;
    const heading = isStatusError
      ? labels.errorHeading
      : labels.serverErrorHeading;

    // Log error
    console.error("Error rendering PDF", state.error);

    return <ErrorBlock heading={heading} message={message} reset={refresh} />;
  }, [state, labels]);

  const handleBackToTop = () => {
    if (!wrapperRef || !wrapperRef.current || !document) return;
    const bounding = wrapperRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY + bounding.top;

    // Scroll to top
    document.body.scrollTop = scrollTop; // For Safari
    document.documentElement.scrollTop = scrollTop; // For Chrome, Firefox, IE and Opera
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) =>
    setState({
      numPages,
      error: undefined,
    });

  const onDocumentLoadError = (error: Error) =>
    setState({
      numPages: 0,
      error,
    });

  const { numPages } = state;

  const fileMb = size ? parseInt(size, 10) / 1024 ** 2 : 0;

  if (!url) return <NoContent message={labels.noContent} />;

  return fileMb > 100 ? (
    <NoContent
      message={
        <>
          {labels.cannotBeDisplayedPrefix}
          <a
            className="no-hover-shadow hover:text-neutral-90"
            style={{ marginInline: "5px" }}
            href={url || ""}
            download
          >
            {labels.cannotBeDisplayedLink}
          </a>
          {labels.cannotBeDisplayedSuffix}
        </>
      }
    />
  ) : (
    <div className={styles.wrapper} ref={wrapperRef}>
      <Document
        file={url}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<LoadingBlock />}
        error={renderError}
      >
        <div className={styles.document}>
          <AssetInlinePDFNav
            numPages={numPages > 25 ? 25 : numPages}
            pageId="page"
            contentId="pdfContent"
            skipLinkLabel={labels.skipToPdfContent}
            pageLabel={labels.pageNumberTemplate}
          />
          <div className={styles.pages} id="pdfContent" tabIndex={-1}>
            {Array.from(new Array(numPages > 25 ? 25 : numPages), (_el, i) => {
              return (
                <AssetInlinePDFPage
                  key={i}
                  pageId="page"
                  pageNumber={i + 1}
                  pageLabel={labels.pageNumberTemplate}
                />
              );
            })}
            {numPages > 25 && (
              <NoContent
                message={
                  <>
                    {labels.viewFullPdfPrefix}
                    <a
                      key="no-content"
                      className="no-hover-shadow hover:text-neutral-90"
                      style={{
                        marginInlineStart: "5px",
                      }}
                      href={url || ""}
                      download
                    >
                      {labels.viewFullPdfLink}
                    </a>
                    {labels.viewFullPdfSuffix}
                  </>
                }
              />
            )}
            <div className={styles.backToTop}>
              <BackToTopButton onClick={handleBackToTop}>
                {labels.backToTop}
              </BackToTopButton>
            </div>
          </div>
        </div>
      </Document>
    </div>
  );
}
