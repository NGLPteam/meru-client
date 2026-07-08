import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { Trans, useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import { NoContent } from "@/components/layout";
import { LoadingBlock, Pagination } from "@/components/atomic";
import EntitySummary from "@/components/composed/entity/EntitySummary";
import styles from "./SearchResults.module.css";

export default function SearchResults({ data, isLoading }: Props) {
  const results = useFragment(fragment, data);

  const { t } = useTranslation();

  const queryVars = useSearchParams();
  const q = routeQueryArrayToString(queryVars.get("q"));
  const resultsI18nKey = q
    ? "search.count_results_for_name"
    : "search.count_results";

  return isLoading ? (
    <LoadingBlock />
  ) : (
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
        <>
          <ul>
            {results.nodes.map(({ entity }, i) => (
              <EntitySummary key={i} data={entity} />
            ))}
          </ul>
          <Pagination data={results.pageInfo} />
        </>
      ) : (
        <NoContent message={t("search.no_results")} />
      )}
    </>
  );
}

interface Props {
  data?: FragmentType<typeof fragment>;
  isLoading?: boolean;
}

const fragment = graphql(`
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
