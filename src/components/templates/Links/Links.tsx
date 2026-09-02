import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import type { HeroBackground } from "@/types/graphql-schema";
import {
  CompactListBlock,
  GridListBlock,
  CardListBlock,
  SummaryListBlock,
  PromoListBlock,
  TreeListBlock,
} from "../lists/blocks";

const VARIANT_TO_COMPONENT = {
  COMPACT: CompactListBlock,
  CARDS: CardListBlock,
  GRID: GridListBlock,
  SUMMARY: SummaryListBlock,
  PROMOS: PromoListBlock,
  TREE: TreeListBlock,
};

export default function Links({
  data,
  bgOverride,
  slug,
}: {
  data: FragmentType<typeof fragment>;
  bgOverride?: HeroBackground | null;
  slug?: string;
}) {
  const template = useFragment(fragment, data);

  const variant =
    template && "linksDefinition" in template
      ? template.linksDefinition?.variant
      : undefined;

  const BlockComponent =
    variant && variant !== "%future added value"
      ? VARIANT_TO_COMPONENT[variant]
      : null;

  return (
    BlockComponent && (
      <BlockComponent data={template} bgOverride={bgOverride} slug={slug} />
    )
  );
}

const fragment = graphql(`
  fragment LinksTemplateFragment on AnyMainTemplateInstance {
    ... on LinkListTemplateInstance {
      __typename
      linksDefinition: definition {
        variant
      }
    }
    ...sharedListTemplateFragment
  }
`);
