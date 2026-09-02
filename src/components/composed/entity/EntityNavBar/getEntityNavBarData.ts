import { markdownToTxt } from "markdown-to-txt";
import {
  useFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers";
import { templateSlotInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import { entityNavBarFragment, entityNavListFragment } from "./graphql";

type NavListData = DocumentType<typeof entityNavListFragment>;

export type EntityNavBarData = {
  slug: string;
  title: string;
  basePath: string;
  enableDescendantBrowsing: boolean;
  enableDescendantSearch: boolean;
  // Search placeholder from the descendantSearchPrompt slot, already reduced
  // to plain text (markdown stripped); null → t() fallback.
  searchPrompt: string | null;
  schemaIdentifier: string;
  orderings: NavListData["orderings"]["nodes"];
  pages: NavListData["pages"]["nodes"];
};

export function getEntityNavBarData(
  data?: FragmentType<typeof entityNavBarFragment> | null,
): EntityNavBarData | null {
  const entity = useFragment(entityNavBarFragment, data);
  if (!entity || !entity.slug || !entity.title) return null;

  const { enableDescendantSearch, enableDescendantBrowsing } =
    entity.layouts?.hero?.template?.definition ?? {};

  const prompt = useFragment(
    templateSlotInlineFragment,
    entity.layouts?.hero?.template?.slots.descendantSearchPrompt,
  );

  const navList = useFragment(entityNavListFragment, entity);

  return {
    slug: entity.slug,
    title: entity.title,
    basePath: `/${getRouteByEntityType(navList.__typename)}/${entity.slug}`,
    enableDescendantBrowsing: !!enableDescendantBrowsing,
    enableDescendantSearch: !!enableDescendantSearch,
    searchPrompt:
      prompt?.valid && prompt.content ? markdownToTxt(prompt.content) : null,
    schemaIdentifier: navList.schemaVersion.identifier,
    orderings: navList.orderings?.nodes ?? [],
    pages: navList.pages?.nodes ?? [],
  };
}
