import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export const processingCheckFragment = graphql(`
  fragment ProcessingCheckFragment on EntityLayouts {
    main {
      allHidden
      templates {
        ... on TemplateInstance {
          __typename
        }
      }
    }
  }
`);

// Whether the entity has renderable main content. Not a hook (useFragment is
// codegen's identity unmask) — .astro shells call this server-side to decide
// between the main layout and the empty message.
export function hasMainContent(
  data?: FragmentType<typeof processingCheckFragment> | null,
): boolean {
  const { main } = useFragment(processingCheckFragment, data) ?? {};
  return !main?.allHidden && !!main?.templates?.length;
}
