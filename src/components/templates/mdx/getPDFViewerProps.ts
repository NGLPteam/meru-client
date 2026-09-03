import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import remarkGfm from "remark-gfm";
import type { MDXComponents } from "mdx/types";
import { blockSlotComponents } from "./components";

type PDFViewerProps = { url?: string | null; size?: string | null };

// Extracts the <PDFViewer> props from a full-text body slot by rendering it
// through the real MDX pipeline with a capturing component, so Full.astro can
// mount the react-pdf viewer as a leaf client:only island with scalar props
// instead of hydrating the whole layout. Server-only.
export async function getPDFViewerProps(
  content: string,
): Promise<PDFViewerProps | null> {
  let captured: PDFViewerProps | null = null;
  try {
    const { default: Content } = await evaluate(content, {
      ...runtime,
      remarkPlugins: [remarkGfm],
    });
    const components = {
      ...blockSlotComponents,
      PDFViewer: (props: PDFViewerProps) => {
        captured = props;
        return null;
      },
    } as MDXComponents;
    renderToStaticMarkup(createElement(Content, { components }));
  } catch {
    return null;
  }
  return captured;
}
