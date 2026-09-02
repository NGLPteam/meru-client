"use client";

import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import Container from "@/components/layout/Container";
import NavigationTabs from "./NavigationTabs";

export default function EntityNavigationTemplate({
  data,
  slug,
  pathname,
  renderMainLayout,
}: {
  data?: FragmentType<typeof fragment> | null;
  slug: string;
  pathname: string;
  renderMainLayout: boolean;
}) {
  const { template } = useFragment(fragment, data) ?? {};

  const { definition } = template ?? {};

  return template ? (
    <Container bgColor={definition?.background}>
      <NavigationTabs
        data={template}
        slug={slug}
        pathname={pathname}
        renderMainLayout={renderMainLayout}
      />
    </Container>
  ) : null;
}

const fragment = graphql(`
  fragment EntityNavigationTemplateFragment on NavigationLayoutInstance {
    template {
      definition {
        background
      }
      ...NavigationTabsFragment
    }
  }
`);
