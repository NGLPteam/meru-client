import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

// Whether the item's main layout should render: a FULL detail template with
// showBody requires valid full-text body content. Not a hook (useFragment is
// codegen's identity unmask) — the item .astro page calls this server-side to
// 302 items without full text to /metadata before rendering.
export function shouldRenderMainLayout(
  data?: FragmentType<typeof fragment> | null,
): boolean {
  const { main } = useFragment(fragment, data) ?? {};

  const fullDetailTemplate = main?.templates?.find(
    (t) => t.definition?.variant === "FULL",
  );

  const body = fullDetailTemplate?.slots?.body;

  const hasFullText = !!body && body.valid && !!body.content;
  const showBody = fullDetailTemplate?.definition?.showBody;

  return showBody ? hasFullText : true;
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
