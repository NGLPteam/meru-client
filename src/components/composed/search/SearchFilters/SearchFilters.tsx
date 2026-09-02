import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";
import isEmpty from "lodash/isEmpty";
import { navigate } from "astro:transitions/client";
import {
  graphql,
  useFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";
import { filterSearchableProperties } from "@/helpers/search";
import { removeEmptyKeys } from "@/helpers/search";
import { Fieldset, BaseForm } from "@/components/forms";
import { Button } from "@/components/atomic";
import SearchFilter from "../SearchFilter";
import SearchOrderBy from "../SearchOrderBy";
import SearchSchemaFilter from "../SearchSchemaFilter";
import styles from "./SearchFilters.module.css";

export default function SearchFilters({
  data,
  id,
  onSubmit: onSubmitCallback,
  pathname,
  search,
}: Props) {
  const searchData = useFragment(fragment, data);

  const { t } = useTranslation();

  const searchParams = new URLSearchParams(search);

  const defaultValues = {
    ...(searchParams.get("filters") && {
      ...JSON.parse(String(searchParams.get("filters"))),
    }),
    schema: searchParams.get("schema")?.split(","),
  };

  const onSubmit = (data: Record<string, string>) => {
    removeEmptyKeys(data);

    const { schema, ...filters } = data;

    const params = new URLSearchParams(searchParams);
    params.set("page", "1");

    if (!isEmpty(filters)) {
      params.set("filters", JSON.stringify(filters));
    } else {
      params.delete("filters");
    }
    if (schema) {
      params.set("schema", schema);
    } else {
      params.delete("schema");
    }

    const url = `${pathname}?${params.toString()}`;

    navigate(url);

    if (onSubmitCallback) onSubmitCallback(params);
  };

  const handleReset = () => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    params.delete("filters");
    params.delete("schema");
    params.delete("order");

    const url = `${pathname}?${params.toString()}`;

    navigate(url);

    if (onSubmitCallback) onSubmitCallback(params);
  };

  const schemaProps = useMemo(() => {
    if (!searchData) return [];

    const flat = flatMap(searchData.schemas, (args) => {
      return args.searchableProperties;
    });

    return filterSearchableProperties<FilterNode>(
      uniqBy(flat, "searchPath") as FilterNode[],
    );
  }, [searchData]);

  const coreProps = useMemo(
    () => filterSearchableProperties<FilterNode>(searchData.coreProperties),
    [searchData],
  );

  return (
    <BaseForm onSubmit={onSubmit} defaultValues={defaultValues}>
      {({ form: { reset } }) => (
        <>
          <div className={styles.filters} id={id}>
            <SearchOrderBy
              onSubmit={onSubmitCallback}
              pathname={pathname}
              search={search}
            />
            {searchData && (
              <Fieldset legend={t("filter.results_header")}>
                <SearchSchemaFilter data={searchData} />
                {coreProps.map((prop: FilterNode, i: number) => (
                  <SearchFilter key={i} data={prop} />
                ))}
                {schemaProps.map((prop: FilterNode, i: number) => (
                  <SearchFilter key={i} data={prop} />
                ))}
              </Fieldset>
            )}
          </div>
          <div className={styles.buttons}>
            <Button type="submit" size="sm">
              {t("common.submit")}
            </Button>
            <Button
              type="reset"
              secondary
              size="sm"
              onClick={() => {
                handleReset();
                reset({});
              }}
            >
              {t("filter.clear_filters")}
            </Button>
          </div>
        </>
      )}
    </BaseForm>
  );
}

interface Props {
  data: FragmentType<typeof fragment>;
  /** a11y ID for form compontents */
  id?: string;
  /** Callback runs on form submit.
   * Used for closing the filter drawer after submission.
   */
  onSubmit?: (params: URLSearchParams) => void;
  // The search page's location; submits push a new query string onto it.
  pathname: string;
  search: string;
}

type FilterNode = DocumentType<typeof fragment>["coreProperties"][number];

const fragment = graphql(`
  fragment SearchFiltersFragment on SearchScope {
    coreProperties {
      ... on SearchableProperty {
        searchPath
      }
      ...SearchFilterFragment
    }
    ...SearchSchemaFilterFragment
    schemas: availableSchemaVersions {
      searchableProperties {
        ... on SearchableProperty {
          searchPath
          label
        }
        ...SearchFilterFragment
      }
    }
  }
`);
