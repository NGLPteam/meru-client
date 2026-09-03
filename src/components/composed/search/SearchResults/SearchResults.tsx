// Statically rendered results list. The query term arrives as a prop from the
// hosting .astro page, and Pagination is mounted there as a sibling island —
// see SearchLayout.astro.
import { t } from "@/lib/i18n";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { NoContent } from "@/components/layout";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import styles from "./SearchResults.module.css";

export default function SearchResults({ data, q }: Props) {
  const results = useFragment(fragment, data);

  const count = results?.pageInfo?.totalCount ?? 0;

  return (
    <>
      <header className={styles.header}>
        {count}{" "}
        <span className="t-copy-light">
          {t(q ? "search.results_for_label" : "search.results_label", {
            count,
          })}
        </span>
        {q && (
          <>
            {" "}
            <em>&quot;{q}&quot;</em>
          </>
        )}
      </header>
      {results && results.nodes.length > 0 ? (
        <ul>
          {results.nodes.map(({ entity }, i) => (
            <EntitySummary key={i} data={entity} />
          ))}
        </ul>
      ) : (
        <NoContent message={t("search.no_results")} />
      )}
    </>
  );
}

interface Props {
  data?: FragmentType<typeof fragment>;
  q?: string;
}

export const fragment = graphql(`
  fragment SearchResultsFragment on SearchResultConnection {
    nodes {
      entity {
        ... on Node {
          id
        }
        ...EntitySummaryFragment
      }
    }
    pageInfo {
      totalCount
      ...PaginationFragment
    }
  }
`);
