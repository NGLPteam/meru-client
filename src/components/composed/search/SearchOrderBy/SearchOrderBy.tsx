import React from "react";
import { useTranslation } from "react-i18next";
import { navigate } from "astro:transitions/client";
import { Fieldset, Select } from "@/components/forms";

export default function SearchOrderBy({
  onSubmit,
  pathname,
  search,
}: {
  onSubmit?: (params: URLSearchParams) => void;
  // The search page's location; order changes push a new query string onto it.
  pathname: string;
  search: string;
}) {
  const { t } = useTranslation();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(search);
    params.set("order", e.target.value);

    const url = `${pathname}?${params.toString()}`;

    navigate(url);

    if (onSubmit) onSubmit(params);
  };

  return (
    <Fieldset legend={t("sort.results_header")}>
      <Select
        id="sortSearch"
        label={t("sort.label")}
        size="lg"
        block
        hideLabel
        onChange={onChange}
        defaultValue={
          new URLSearchParams(search).get("order") || "PUBLISHED_ASCENDING"
        }
      >
        <option disabled>{t("list.order_by_label")}</option>
        <option value="PUBLISHED_ASCENDING">Publish Date, Ascending</option>
        <option value="PUBLISHED_DESCENDING">Publish Date, Descending</option>
        <option value="OLDEST">Date Created, Ascending</option>
        <option value="RECENT">Date Created, Descending</option>
        <option value="TITLE_ASCENDING">Title, A-Z</option>
        <option value="TITLE_DESCENDING">Title, Z-A</option>
        <option value="SCHEMA_NAME_ASCENDING">Schema, Ascending</option>
        <option value="SCHEMA_NAME_DESCENDING">Schema, Descending</option>
      </Select>
    </Fieldset>
  );
}
