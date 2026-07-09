"use client";

import { useMemo, useState, type ComponentProps } from "react";
import { useQuery } from "urql";
import { useSearchParams, useRouter, usePathname } from "@/lib/routing/hooks";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import BrowseListLayout from "@/components/layout/BrowseListLayout";
import BrowseTreeLayout from "@/components/layout/BrowseTreeLayout";
import { NoContent } from "@/components/layout";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import type { ListEntityContext } from "@/types/graphql-schema";

export default function EntityOrderingLayout({ data, showContext }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Initial (SSR) data provides the ordering id used to refetch pages client-side.
  const base = useFragment(fragment, data);
  const id = base?.id;

  const [page, setPage] = useState<number | null>(null);

  const [result] = useQuery({
    query: refetchQuery,
    variables: { id: id ?? "", page: page ?? 1 },
    pause: page === null || !id,
  });

  const refetched = useFragment(
    fragment,
    result.data?.node?.__typename
      ? (result.data.node as FragmentType<typeof fragment>)
      : null,
  );

  const ordering = page !== null && refetched ? refetched : base;
  const isPending = result.fetching;

  const onPageChange = (val: Record<string, string | number>) => {
    const pageNum = val.page
      ? typeof val.page === "string"
        ? parseInt(val.page)
        : val.page
      : null;
    if (!pageNum) return;

    const params = new URLSearchParams(searchParams);
    params.set("page", pageNum.toString());
    const url = `${pathname}?${params.toString()}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(url);

    setPage(pageNum);
  };

  const pageInfo = useMemo(() => ordering?.children.pageInfo, [ordering]);

  const mode = ordering?.render?.mode;

  return ordering ? (
    mode === "TREE" ? (
      <BrowseTreeLayout
        data={ordering.children}
        header={ordering.header || ordering.name}
        isPending={isPending}
        onPageChange={onPageChange}
      />
    ) : (
      <BrowseListLayout
        data={pageInfo}
        entityData={ordering.entity}
        header={ordering.header || ordering.name}
        onPageChange={onPageChange}
        isPending={isPending}
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

const refetchQuery = graphql(`
  query EntityOrderingLayoutRefetchQuery($id: ID!, $page: Int) {
    node(id: $id) {
      __typename
      ...EntityOrderingLayoutFragment
    }
  }
`);
