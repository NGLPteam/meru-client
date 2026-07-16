"use client";

import { PropsWithChildren, createContext, useContext } from "react";
import {
  graphql,
  useFragment as readFragment,
  type FragmentType,
} from "@/lib/api/gql";

type Props = PropsWithChildren & {
  data?: FragmentType<typeof fragment> | null;
};

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

export default function FullTextCheck({ data, children }: Props) {
  const renderMainLayout = shouldRenderMainLayout(data);

  return (
    <FullTextCheckContext.Provider value={renderMainLayout}>
      {children}
    </FullTextCheckContext.Provider>
  );
}

export const useFullTextCheck = () => {
  return useContext(FullTextCheckContext);
};

export const FullTextFallback = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const renderMainLayout = useFullTextCheck();

  if (renderMainLayout) return null;

  return children;
};

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
