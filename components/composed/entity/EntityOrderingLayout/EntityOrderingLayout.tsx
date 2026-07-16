"use client";

// Ordering browse (list or tree), rendered entirely from SSR data. The hosting
// .astro page reads ?page from the URL and fetches server-side; pagination is
// Pagination's default URL push, which re-renders the page on the server
// (SSR-on-navigation). No client-side GraphQL.
import { type ComponentProps } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import BrowseListLayout from "@/components/layout/BrowseListLayout";
import BrowseTreeLayout from "@/components/layout/BrowseTreeLayout";
import { NoContent } from "@/components/layout";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import type { ListEntityContext } from "@/types/graphql-schema";

export default function EntityOrderingLayout({ data, showContext }: Props) {
  const ordering = useFragment(fragment, data);

  const mode = ordering?.render?.mode;

  return ordering ? (
    mode === "TREE" ? (
      <BrowseTreeLayout
        data={ordering.children}
        header={ordering.header || ordering.name}
      />
    ) : (
      <BrowseListLayout
        data={ordering.children.pageInfo}
        entityData={ordering.entity}
        header={ordering.header || ordering.name}
        items={ordering.children.edges.map(({ node: { entry } }) => (
          <EntitySummary
            key={entry.slug}
            data={entry as ComponentProps<typeof EntitySummary>["data"]}
            showContext={showContext}
            browseStyle
          />
        ))}
      />
    )
  ) : (
    <div className="l-container-wide l-container-wide--p-lg">
      <NoContent />
    </div>
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  showContext?: ListEntityContext;
}

const fragment = graphql(`
  fragment EntityOrderingLayoutFragment on Ordering {
    id
    name
    header
    render {
      mode
    }
    entity {
      __typename
      ... on Sluggable {
        slug
      }
      ...BackButtonFragment
    }
    children(page: $page) {
      edges {
        node {
          id
          entry {
            ... on Sluggable {
              slug
            }
            ...EntitySummaryFragment
          }
        }
      }
      pageInfo {
        ...BrowseListLayoutFragment
      }
      ...BrowseTreeLayoutFragment
    }
  }
`);
