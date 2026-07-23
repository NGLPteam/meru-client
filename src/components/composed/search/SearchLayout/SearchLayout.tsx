"use client";

// Search results + filters, rendered entirely from SSR data. The hosting
// .astro page parses the URL search params (q, filters, page, order, schema)
// into the query variables and fetches server-side; every interaction here
// (submit, filter, order, pagination) is a router.push that re-renders the
// page on the server (SSR-on-navigation). No client-side GraphQL.
import { useRef } from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { useRouter, usePathname, useSearchParams } from "@/lib/routing/hooks";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { Button, CloseModalButton } from "@/components/atomic";
import { NoContent } from "@/components/layout";
import SearchBar from "../SearchBar";
import SearchResults from "../SearchResults";
import SearchFilters from "../SearchFilters";
import styles from "./SearchLayout.module.css";

export default function SearchLayout({ data, scoped }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const noSearchQuery =
    !searchParams.get("q") &&
    !searchParams.get("filters") &&
    !searchParams.get("schema");

  const globalData = useFragment(
    globalQueryFragment,
    !scoped ? (data as FragmentType<typeof globalQueryFragment>) : null,
  );
  const entityData = useFragment(
    entityFragment,
    scoped ? (data as FragmentType<typeof entityFragment>) : null,
  );

  const search = scoped ? entityData?.search : globalData?.search;

  // Native <dialog> for the mobile filters drawer (reakit is React-19-incompatible).
  const drawerRef = useRef<HTMLDialogElement>(null);

  const { register, handleSubmit } = useForm({
    shouldUseNativeValidation: true,
  });

  const onQuerySubmit = (formData: { q?: string }) => {
    const params = new URLSearchParams(searchParams);
    if (formData.q) {
      params.set("q", formData.q);
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
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
          <Button
            onClick={() => drawerRef.current?.showModal()}
            size="sm"
            icon="hamburger"
            secondary
          >
            Show Filters
          </Button>
        </div>
        <div className={styles.sidebar}>
          {search && <SearchFilters id="sidebarFilters" data={search} />}
        </div>
        <div className={styles.results}>
          {noSearchQuery ? (
            <NoContent message="search.start_search" />
          ) : (
            <SearchResults data={search?.results} />
          )}
        </div>
      </div>
      {/* Backdrop click closes; Escape handles keyboard dismissal natively via showModal(). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <dialog
        ref={drawerRef}
        className={styles.drawer}
        aria-label="Filters"
        onClick={(e) => {
          if (e.target === drawerRef.current) drawerRef.current?.close();
        }}
      >
        <div className={styles.drawerInner}>
          <div className={styles.drawerHeader}>
            <form method="dialog">
              <CloseModalButton />
            </form>
          </div>
          <div className={styles.drawerContent}>
            {search && (
              <SearchFilters
                id="mobileFilters"
                data={search}
                onSubmit={() => drawerRef.current?.close()}
              />
            )}
          </div>
        </div>
      </dialog>
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
