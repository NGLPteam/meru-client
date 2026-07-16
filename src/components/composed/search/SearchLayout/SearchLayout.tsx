"use client";

// Search results + filters, rendered entirely from SSR data. The hosting
// .astro page parses the URL search params (q, filters, page, order, schema)
// into the query variables and fetches server-side; every interaction here
// (submit, filter, order, pagination) is a router.push that re-renders the
// page on the server (SSR-on-navigation). No client-side GraphQL.
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { useDialogState, DialogDisclosure } from "reakit/Dialog";
import { useRouter, usePathname, useSearchParams } from "@/lib/routing/hooks";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import BaseDrawer from "@/components/layout/BaseDrawer";
import { Button } from "@/components/atomic";
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

  const dialog = useDialogState({ animated: true });

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
      <BaseDrawer label="Filters" dialog={dialog}>
        {search && (
          <SearchFilters
            id="mobileFilters"
            data={search}
            onSubmit={() => dialog.hide()}
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
