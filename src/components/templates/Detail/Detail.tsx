import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import type { HeroBackground } from "@/types/graphql-schema";
import Summary from "./Summary";
import Full from "./Full";
import Columns from "./Columns";

const VARIANT_MAP = {
  FULL: Full,
  SUMMARY: Summary,
  COLUMNS: Columns,
};

export default function DetailTemplate({
  data,
  bgOverride,
}: {
  data?: FragmentType<typeof fragment> | null;
  bgOverride?: HeroBackground | null;
}) {
  const template = useFragment(fragment, data);

  const { detailDefinition, hidden } = template ?? {};

  if (hidden) return null;

  const { background, variant } = detailDefinition ?? {};

  if (!variant || variant === "%future added value") return null;

  const Variant = VARIANT_MAP[variant];

  return <Variant data={template} bgColor={bgOverride ?? background} />;
}

const fragment = graphql(`
  fragment DetailTemplateFragment on DetailTemplateInstance {
    __typename
    hidden
    detailDefinition: definition {
      background
      variant
    }
    ...SummaryDetailFragment
    ...FullDetailFragment
    ...ColumnsDetailFragment
  }
`);
