import { useFragment, type FragmentType } from "@/lib/api/gql";
import { templateSlotInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import { getBgClass } from "@/components/templates/helpers/bgColor";
import {
  communityHeroHeaderFragment,
  entityHeroHeaderFragment,
} from "./graphql";

const mainRegex = /^\/communities\/[A-Za-z0-9]{30,32}$/;

export const isMainPath = (pathname: string) =>
  mainRegex.test(pathname) || pathname.startsWith("/permalink");

// What the .astro shell should pass its SearchHero, or null when the hero
// renders none.
export function getSearchHeroProps(
  data: FragmentType<typeof communityHeroHeaderFragment> | null | undefined,
  pathname: string,
) {
  const layout = useFragment(communityHeroHeaderFragment, data);
  const { showBigSearchPrompt } = layout?.template?.definition ?? {};
  if (!isMainPath(pathname) || !showBigSearchPrompt) return null;
  const prompt = useFragment(
    templateSlotInlineFragment,
    layout?.template?.slots?.bigSearchPrompt,
  );
  return { prompt: prompt?.content ?? null };
}

// What an .astro shell should pass its BreadcrumbsBar. See
// getHeroBreadcrumbProps in ../getHeroProps.ts.
export function getBreadcrumbsBarProps(
  data?: FragmentType<typeof entityHeroHeaderFragment> | null,
) {
  const layout = useFragment(entityHeroHeaderFragment, data);
  const { template, entity } = layout ?? {};
  const { background, showBreadcrumbs, showSharingLink } =
    template?.definition ?? {};
  if (!entity || (!showBreadcrumbs && !showSharingLink)) return null;
  return {
    data: entity,
    showShare: showSharingLink ?? false,
    className: getBgClass(background),
  };
}
