"use client";

import {
  graphql,
  useFragment,
  useFragment as readFragment,
  type FragmentType,
} from "@/lib/api/gql";
import CommunityHeroHeader, { getSearchHeroProps } from "./patterns/Community";
import EntityHeroHeader, { getBreadcrumbsBarProps } from "./patterns/Entity";

export default function HeroTemplate({
  data,
  hideBreadcrumbsBar,
  hideSearchHero,
  pathname,
}: {
  data: FragmentType<typeof fragment> | null;
  // Set by .astro shells that mount BreadcrumbsBar / SearchHero themselves as
  // hydrated islands (they can't hydrate from inside this statically-rendered
  // tree). pathname is threaded for the community pattern's main-page gate.
  hideBreadcrumbsBar?: boolean;
  hideSearchHero?: boolean;
  pathname?: string;
}) {
  const layout = useFragment(fragment, data);

  const { entity } = layout ?? {};

  const isCommunity = entity?.__typename === "Community";

  return isCommunity ? (
    <CommunityHeroHeader
      data={layout}
      pathname={pathname}
      hideSearchHero={hideSearchHero}
    />
  ) : (
    <EntityHeroHeader data={layout} hideBreadcrumbsBar={hideBreadcrumbsBar} />
  );
}

// Server-side companion to hideBreadcrumbsBar: what the .astro shell should
// pass its BreadcrumbsBar island, or null when the hero renders none.
export function getHeroBreadcrumbProps(
  data: FragmentType<typeof fragment> | null,
) {
  const layout = readFragment(fragment, data);
  if (!layout || layout.entity?.__typename === "Community") return null;
  return getBreadcrumbsBarProps(layout);
}

// Community counterpart for hideSearchHero: what the .astro shell should pass
// its SearchHero island, or null when the hero renders none.
export function getHeroSearchProps(
  data: FragmentType<typeof fragment> | null,
  pathname: string,
) {
  const layout = readFragment(fragment, data);
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
