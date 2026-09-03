import type { TFunction } from "i18next";
import type { AssetInlinePDFLabels } from "./AssetInlinePDF";

// Builds the island's translated labels server-side (Astro.locals.t or the
// lib/i18n t). The *Template values interpolate {{code}}/{{number}} with a
// literal placeholder the island substitutes at render time.
export function getAssetInlinePDFLabels(t: TFunction): AssetInlinePDFLabels {
  return {
    noContent: t("common.no_content"),
    cannotBeDisplayedPrefix: t("asset.pdf_cannot_be_displayed_prefix"),
    cannotBeDisplayedLink: t("asset.pdf_cannot_be_displayed_link"),
    cannotBeDisplayedSuffix: t("asset.pdf_cannot_be_displayed_suffix"),
    viewFullPdfPrefix: t("asset.view_full_pdf_prefix"),
    viewFullPdfLink: t("asset.view_full_pdf_link"),
    viewFullPdfSuffix: t("asset.view_full_pdf_suffix"),
    serverErrorTemplate: t("asset.pdf_server_error", { code: "{code}" }),
    renderError: t("asset.pdf_render_error"),
    errorHeading: t("messages.error"),
    serverErrorHeading: t("messages.server_error"),
    backToTop: t("common.back_to_top"),
    skipToPdfContent: t("nav.skip_to_pdf_content"),
    pageNumberTemplate: t("list.page_number", { number: "{number}" }),
  };
}
