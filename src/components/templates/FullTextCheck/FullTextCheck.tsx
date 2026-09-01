"use client";

import { createContext, useContext } from "react";
import {
  graphql,
  useFragment as readFragment,
  type FragmentType,
} from "@/lib/api/gql";

// Default true: NavigationTabs falls back to this context only inside legacy
// islands; .astro shells pass renderMainLayout as a prop.
const FullTextCheckContext = createContext(true);

// Whether the item's main layout should render: a FULL detail template with
// showBody requires valid full-text body content. Not a hook (readFragment is
// codegen's identity unmask) — the item .astro page calls this server-side to
// 302 items without full text to /metadata before rendering.
export function shouldRenderMainLayout(
  data?: FragmentType<typeof fragment> | null,
): boolean {
  const { main } = readFragment(fragment, data) ?? {};

  const fullDetailTemplate = main?.templates?.find(
    (t) => t.definition?.variant === "FULL",
  );

  const body = fullDetailTemplate?.slots?.body;

  const hasFullText = !!body && body.valid && !!body.content;
  const showBody = fullDetailTemplate?.definition?.showBody;

  return showBody ? hasFullText : true;
}

export const useFullTextCheck = () => {
  return useContext(FullTextCheckContext);
};

// Whether the item's full-text body is a PDF embed. The .astro item page uses
// this to hydrate MainLayout as an island for PDF items: the PDF viewer is a
// clientOnly component (react-pdf), so it renders nothing in a static tree.
export function hasPDFFullText(
  data?: FragmentType<typeof fragment> | null,
): boolean {
  const { main } = readFragment(fragment, data) ?? {};
  const fullDetailTemplate = main?.templates?.find(
    (t) => t.definition?.variant === "FULL",
  );
  return !!fullDetailTemplate?.slots?.body?.content?.startsWith("<PDFViewer");
}

const fragment = graphql(`
  fragment FullTextCheckFragment on EntityLayouts {
    main {
      templates {
        ... on DetailTemplateInstance {
          definition {
            showBody
            variant
          }
          slots {
            body {
              valid
              content
            }
          }
        }
      }
    }
  }
`);
