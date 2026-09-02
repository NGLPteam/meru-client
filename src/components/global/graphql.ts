import { graphql, type FragmentType } from "@/lib/api/gql";

// The active community bundle for the header/footer clusters: name/logo, nav
// list, and the picker's active title. Entity page queries spread this on the
// page's community so BaseLayout can thread one ref into AppHeader/AppFooter,
// which pass it down to their islands as a plain prop.
export const ActiveCommunityFragment = graphql(`
  fragment ActiveCommunityFragment on Community {
    ...CommunityNameFragment
    ...CommunityNavListFragment
    ...CommunityPickerCommunityNameFragment
  }
`);

export type ActiveCommunityRef =
  FragmentType<typeof ActiveCommunityFragment> | null | undefined;
