"use client";

import { useMemo } from "react";
import { useQuery } from "urql";
import classNames from "classnames";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import BaseDrawer from "@/components/layout/BaseDrawer";
import { Button } from "@/components/atomic";
import { NoContent } from "@/components/layout";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { getPredicates } from "@/helpers/search";
import { EntityOrder } from "@/types/graphql-schema";
import SearchBar from "../SearchBar";
import SearchResults from "../SearchResults";
import SearchFilters from "../SearchFilters";
import styles from "./SearchLayout.module.css";

function parseSearchVars(params: URLSearchParams) {
  const filters = params.get("filters")
    ? routeQueryArrayToString(params.get("filters"))
    : null;
  const page = routeQueryArrayToString(params.get("page"));
  const q = routeQueryArrayToString(params.get("q"));
  const order = routeQueryArrayToString(params.get("order")) as EntityOrder;
  const schema = params.get("schema")?.split(",");

  const predicates = filters ? getPredicates(JSON.parse(filters)) : [];

  return {
    query: q || "",
    predicates: predicates || [],
    page: parseInt(page) || 1,
    order: order || ("PUBLISHED_ASCENDING" as EntityOrder),
    schema,
  };
}

export default function SearchLayout({ data, scoped }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vars = useMemo(
    () => parseSearchVars(new URLSearchParams(searchParams)),
    [searchParams],
  );

  const noSearchQuery =
    (!searchParams.get("q") || searchParams.get("q") === "") &&
    !searchParams.get("filters") &&
    !searchParams.get("schema");

  // The scoped entity id comes from the SSR fragment ref; the global search
  // needs no seed and is fetched entirely client-side off the URL params.
  const entityBase = useFragment(
    entityFragment,
    scoped ? (data as FragmentType<typeof entityFragment>) : null,
  );
  const entityId = entityBase?.id;

  const [globalResult] = useQuery({
    query: globalQuery,
    variables: vars,
    pause: scoped || noSearchQuery,
  });

  const [entityResult] = useQuery({
    query: entityQuery,
    variables: { id: entityId ?? "", ...vars },
    pause: !scoped || noSearchQuery || !entityId,
  });

  const globalData = useFragment(
    globalQueryFragment,
    !scoped ? (globalResult.data ?? null) : null,
  );
  const entityData = useFragment(
    entityFragment,
    scoped && entityResult.data?.node?.__typename
      ? (entityResult.data.node as FragmentType<typeof entityFragment>)
      : null,
  );

  const search = scoped ? entityData?.search : globalData?.search;
  const isPending = scoped ? entityResult.fetching : globalResult.fetching;

  const dialog = useDialogState({ animated: true });

  const { register, handleSubmit } = useForm({
    shouldUseNativeValidation: true,
  });

  const pushSearch = (params: URLSearchParams) => {
    router.push(`${pathname}?${params.toString()}`);
  };

  const onQuerySubmit = (formData: { q?: string }) => {
    const params = new URLSearchParams(searchParams);
    if (formData.q) {
      params.set("q", formData.q);
    } else {
      params.delete("q");
    }
    pushSearch(params);
  };

  return (
    <section className="a-bg-neutral00">
      <div className={classNames("l-container-wide", styles.inner)}>
        <div className={styles.search}>
          <form onSubmit={handleSubmit(onQuerySubmit)}>
            <SearchBar
              id="searchPageInput"
              defaultValue={searchParams.get("q") ?? undefined}
              {...register("q")}
            />
          </form>
        </div>
        <div className={styles.filterToggle}>
          <DialogDisclosure
            as={Button}
            {...dialog}
            size="sm"
            icon="hamburger"
            secondary
          >
            Show Filters
          </DialogDisclosure>
        </div>
        <div className={styles.sidebar}>
          {search && (
            <SearchFilters
              id="sidebarFilters"
              data={search}
              onSubmit={pushSearch}
            />
          )}
        </div>
        <div className={styles.results}>
          {noSearchQuery && !isPending ? (
            <NoContent message="search.start_search" />
          ) : (
            <SearchResults data={search?.results} isLoading={isPending} />
          )}
        </div>
      </div>
      <BaseDrawer label="Filters" dialog={dialog}>
        {search && (
          <SearchFilters
            id="mobileFilters"
            data={search}
            onSubmit={(params: URLSearchParams) => {
              pushSearch(params);
              dialog.hide();
            }}
          />
        )}
      </BaseDrawer>
    </section>
  );
}

type Props = EntityProps | GlobalProps;

interface EntityProps {
  data: FragmentType<typeof entityFragment>;
  scoped: true;
}

interface GlobalProps {
  data: FragmentType<typeof globalQueryFragment>;
  scoped?: false;
}

const globalQueryFragment = graphql(`
  fragment SearchLayoutFragment on Query {
    search {
      results(
        query: $query
        page: $page
        perPage: 20
        predicates: $predicates
        order: $order
        schema: $schema
      ) {
        ...SearchResultsFragment
      }
      ...SearchFiltersFragment
    }
  }
`);

const entityFragment = graphql(`
  fragment SearchLayoutEntityFragment on Entity {
    id
    search {
      results(
        query: $query
        page: $page
        perPage: 20
        predicates: $predicates
        order: $order
        schema: $schema
      ) {
        ...SearchResultsFragment
      }
      ...SearchFiltersFragment
    }
  }
`);

const globalQuery = graphql(`
  query SearchLayoutQuery(
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    ...SearchLayoutFragment
  }
`);

const entityQuery = graphql(`
  query SearchLayoutEntityQuery(
    $id: ID!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    node(id: $id) {
      __typename
      ...SearchLayoutEntityFragment
    }
  }
`);
