import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import IconFactory from "@/components/factories/IconFactory";

export default function ViewCount({ data }: Props) {
  const summary = useFragment(fragment, data);

  const { t } = useTranslation();

  return summary?.total ? (
    <li className="l-flex l-flex--gap">
      <IconFactory icon="view" role="presentation" />
      <span>{t("metadata.view_count", { count: summary.total })}</span>
    </li>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment ViewCountFragment on AnalyticsEventCountSummary {
    total
  }
`);
