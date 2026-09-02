"use client";

import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import CommunityHeroHeader, { getSearchHeroProps } from "./patterns/Community";
import EntityHeroHeader, { getBreadcrumbsBarProps } from "./patterns/Entity";

export default function HeroTemplate({
  data,
  pathname,
}: {
  data: FragmentType<typeof fragment> | null;
  // pathname is threaded for the community pattern's main-page gate.
  pathname?: string;
}) {
  const layout = useFragment(fragment, data);

  const { entity } = layout ?? {};

  const isCommunity = entity?.__typename === "Community";

  return isCommunity ? (
    <CommunityHeroHeader data={layout} pathname={pathname} />
  ) : (
    <EntityHeroHeader data={layout} />
  );
}

// What the .astro shell should pass its BreadcrumbsBar, or null when the hero
// renders none.
export function getHeroBreadcrumbProps(
  data: FragmentType<typeof fragment> | null,
) {
  const layout = useFragment(fragment, data);
  if (!layout || layout.entity?.__typename === "Community") return null;
  return getBreadcrumbsBarProps(layout);
}

// What the .astro shell should pass its SearchHero, or null when the hero
// renders none.
export function getHeroSearchProps(
  data: FragmentType<typeof fragment> | null,
  pathname: string,
) {
  const layout = useFragment(fragment, data);
  if (!layout || layout.entity?.__typename !== "Community") return null;
  return getSearchHeroProps(layout, pathname);
}

const fragment = graphql(`
  fragment HeroTemplateFragment on HeroLayoutInstance {
    entity {
      ... on Community {
        __typename
      }
    }
    ...CommunityHeroHeaderFragment
    ...EntityHeroHeaderFragment
  }
`);
