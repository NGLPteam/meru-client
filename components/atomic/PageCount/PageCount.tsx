import { graphql, useFragment } from "react-relay";
import { Trans } from "react-i18next";
import { PageCountFragment$key } from "@/relay/PageCountFragment.graphql";

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
      <Trans
        i18nKey="list.showing_count_out_of_total"
        values={{
          start,
          end,
          total: totalCount,
          name,
        }}
        components={[<span key="text" className="t-copy-lighter"></span>]}
      />
    </div>
  );
}

interface Props {
  data?: PageCountFragment$key | null;
  className?: string;
  name?: string;
}

const fragment = graphql`
  fragment PageCountFragment on PageInfo {
    totalCount
    page
    perPage
  }
`;
