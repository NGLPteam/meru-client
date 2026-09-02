// Statically rendered results list. The query term arrives as a prop from the
// hosting .astro page, and Pagination is mounted there as a sibling island —
// see SearchLayout.astro.
import { Trans, useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { NoContent } from "@/components/layout";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import styles from "./SearchResults.module.css";

export default function SearchResults({ data, q }: Props) {
  const results = useFragment(fragment, data);

  const { t } = useTranslation();

  const resultsI18nKey = q
    ? "search.count_results_for_name"
    : "search.count_results";

  return (
    <>
      <header className={styles.header}>
        <Trans
          i18nKey={resultsI18nKey}
          values={{
            count: results?.pageInfo?.totalCount,
            name: q,
          }}
          components={[
            <span key="text" className="t-copy-light"></span>,
            <em key="name"></em>,
          ]}
        />
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
