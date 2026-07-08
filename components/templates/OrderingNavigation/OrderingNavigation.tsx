import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import Container from "@/components/layout/Container";
import type { HeroBackground } from "@/types/graphql-schema";
import NavButtons from "./NavButtons";

export default function OrderingNavigationTemplate({
  data,
}: {
  data?: FragmentType<typeof fragment> | null;
  bgOverride?: HeroBackground | null;
}) {
  const template = useFragment(fragment, data);

  const { orderingDefinition, orderingPair } = template ?? {};

  const { background, width } = orderingDefinition ?? {};

  return orderingPair?.exists ? (
    <Container bgColor={background} halfWidthTemplate={width === "HALF"}>
      <NavButtons data={template} />
    </Container>
  ) : null;
}

const fragment = graphql(`
  fragment OrderingNavigationTemplateFragment on OrderingTemplateInstance {
    hidden
    orderingDefinition: definition {
      background
      width
    }
    orderingPair {
      exists
    }
    ...NavButtonsFragment
  }
`);
