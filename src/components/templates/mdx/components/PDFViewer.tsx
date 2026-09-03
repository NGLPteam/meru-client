// AssetInlinePDF's barrel is already a client-only (ssr:false) component, so we
// import it directly rather than re-wrapping it. Full-text PDF bodies never
// reach this component (Detail/Full.astro intercepts them and mounts the
// island directly); in any other slot the clientOnly wrapper renders nothing
// in the static tree, so the labels below are for completeness. Server-only
// module — the direct t import must not enter island graphs.
import { t } from "@/lib/i18n";
import AssetInlinePDF from "@/components/composed/asset/AssetInlinePDF";
import { getAssetInlinePDFLabels } from "@/components/composed/asset/AssetInlinePDF/getLabels";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  name?: string | null;
  size?: string | null;
  slug?: string | null;
  url?: string | null;
};

export default function PDFViewer({ url, size }: Props) {
  return (
    <AssetInlinePDF url={url} size={size} labels={getAssetInlinePDFLabels(t)} />
  );
}
