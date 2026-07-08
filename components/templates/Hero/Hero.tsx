"use client";

import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import CommunityHeroHeader from "./patterns/Community";
import EntityHeroHeader from "./patterns/Entity";

export default function HeroTemplate({
  data,
}: {
  data: FragmentType<typeof fragment> | null;
}) {
  const layout = useFragment(fragment, data);

  const { entity } = layout ?? {};

  const isCommunity = entity?.__typename === "Community";

  return isCommunity ? (
    <CommunityHeroHeader data={layout} />
  ) : (
    <EntityHeroHeader data={layout} />
  );
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
