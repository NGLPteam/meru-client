import React, { useState } from "react";
import { Page } from "react-pdf";
import SkipLink from "@/components/global/SkipLink";
import AssetPDFPage from "../../AssetPDFPage";
import styles from "./AssetInlinePDFNav.module.css";

export default function AssetInlinePDFNav({
  numPages,
  pageId,
  contentId,
  skipLinkLabel,
  pageLabel,
}: Props) {
  const [pagesRendered, setPagesRendered] = useState<number>(0);

  const onRenderSuccess = () => setPagesRendered(pagesRendered + 1);

  /**
   * The amount of pages we want to render now. Always 1 more than already rendered,
   * no more than total amount of pages in the document.
   */
  const pagesRenderedPlusOne = Math.min(pagesRendered + 1, numPages);

  return (
    <div className={styles.thumbnails}>
      <SkipLink toId={contentId} label={skipLinkLabel} />
      <ol className={styles.inner}>
        {Array.from(new Array(pagesRenderedPlusOne), (_el, i) => {
          const isCurrentlyRendering = pagesRenderedPlusOne === i + 1;
          const isLastPage = numPages === i + 1;
          const needsCallbackToRenderNextPage =
            isCurrentlyRendering && !isLastPage;

          return (
            <li key={i}>
              <a className={styles.link} href={`#${pageId}${i + 1}`}>
                <AssetPDFPage pageNumber={i + 1} pageLabel={pageLabel}>
                  <Page
                    key={`page_${i + 1}`}
                    onRenderSuccess={
                      needsCallbackToRenderNextPage
                        ? onRenderSuccess
                        : undefined
                    }
                    pageNumber={i + 1}
                    width={100}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </AssetPDFPage>
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

interface Props {
  numPages: number;
  pageId: string;
  contentId: string;
  /** Already-translated skip-link label */
  skipLinkLabel: string;
  /** Translated page-number template containing "{number}" */
  pageLabel: string;
}
