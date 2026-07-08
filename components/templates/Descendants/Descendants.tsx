import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers/routes";
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

export default function Descendants({
  data,
  bgOverride,
}: {
  data: FragmentType<typeof fragment>;
  bgOverride?: HeroBackground | null;
}) {
  const template = useFragment(fragment, data);

  const entity = template && "entity" in template ? template.entity : undefined;
  const descendantsDefinition =
    template && "descendantsDefinition" in template
      ? template.descendantsDefinition
      : undefined;

  const variant = descendantsDefinition?.variant;

  const basePath = entity
    ? `/${getRouteByEntityType(entity.__typename)}/${"slug" in entity ? entity.slug : ""}`
    : null;

  const BlockComponent = variant ? VARIANT_TO_COMPONENT[variant] : null;

  return (
    BlockComponent && (
      <BlockComponent
        data={template}
        basePath={basePath}
        bgOverride={bgOverride}
      />
    )
  );
}

const fragment = graphql(`
  fragment DescendantsTemplateFragment on AnyMainTemplateInstance {
    ... on DescendantListTemplateInstance {
      entity {
        __typename
        ... on Sluggable {
          slug
        }
      }
      descendantsDefinition: definition {
        variant
      }
    }
    ...sharedListTemplateFragment
  }
`);
