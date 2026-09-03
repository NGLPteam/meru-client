import { t } from "@/lib/i18n";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export default function PageCount({ data, className, name }: Props) {
  const pageData = useFragment(fragment, data);

  if (!pageData || !pageData.perPage || !pageData.page) return null;

  const { page, totalCount, perPage } = pageData;

  const start = totalCount > 0 ? (page - 1) * perPage + 1 : 0;
  const end =
    totalCount < perPage || page * perPage > totalCount
      ? totalCount
      : page * perPage;

  return (
    <div className={className}>
      <span className="t-copy-lighter">{t("list.showing")}</span> {start} -{" "}
      {end} <span className="t-copy-lighter">{t("list.out_of")}</span>{" "}
      {new Intl.NumberFormat("en-US").format(totalCount)} {name}
    </div>
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  className?: string;
  name?: string;
}

const fragment = graphql(`
  fragment PageCountFragment on PageInfo {
    totalCount
    page
    perPage
  }
`);
