import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export const templateSlotBlockFragment = graphql(`
  fragment sharedBlockSlotFragment on TemplateSlotBlockInstance {
    empty
    content
    kind
    valid
  }
`);

export const templateSlotInlineFragment = graphql(`
  fragment sharedInlineSlotFragment on TemplateSlotInlineInstance {
    empty
    content
    kind
    valid
    hidesTemplate
  }
`);

export const useSharedBlockFragment = (
  data?: FragmentType<typeof templateSlotBlockFragment> | null,
) => {
  return useFragment(templateSlotBlockFragment, data);
};

export const useSharedInlineFragment = (
  data?: FragmentType<typeof templateSlotInlineFragment> | null,
) => {
  return useFragment(templateSlotInlineFragment, data);
};
