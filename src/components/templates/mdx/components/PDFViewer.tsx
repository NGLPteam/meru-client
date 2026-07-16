// AssetInlinePDF's barrel is already a client-only (ssr:false) component, so we
// import it directly rather than re-wrapping it.
import AssetInlinePDF from "@/components/composed/asset/AssetInlinePDF";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  name?: string | null;
  size?: string | null;
  slug?: string | null;
  url?: string | null;
};

export default function PDFViewer({ url, size }: Props) {
  return <AssetInlinePDF url={url} size={size} />;
}
