import { useFragment, type FragmentType } from "@/lib/api/gql";
import { heroTemplateFragment } from "./graphql";
import {
  getBreadcrumbsBarProps,
  getSearchHeroProps as getPatternSearchHeroProps,
} from "./patterns/helpers";

// What the .astro shell should pass its BreadcrumbsBar, or null when the hero
// renders none.
export function getHeroBreadcrumbProps(
  data: FragmentType<typeof heroTemplateFragment> | null,
) {
  const layout = useFragment(heroTemplateFragment, data);
  if (!layout || layout.entity?.__typename === "Community") return null;
  return getBreadcrumbsBarProps(layout);
}

// What the .astro shell should pass its SearchHero, or null when the hero
// renders none.
export function getHeroSearchProps(
  data: FragmentType<typeof heroTemplateFragment> | null,
  pathname: string,
) {
  const layout = useFragment(heroTemplateFragment, data);
  if (!layout || layout.entity?.__typename !== "Community") return null;
  return getPatternSearchHeroProps(layout, pathname);
}
