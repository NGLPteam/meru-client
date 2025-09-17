import { graphql, useFragment } from "react-relay";
import { useTranslation } from "react-i18next";
import IconFactory from "@/components/factories/IconFactory";
import { ViewCountFragment$key } from "@/relay/ViewCountFragment.graphql";

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
  data?: ViewCountFragment$key | null;
}

const fragment = graphql`
  fragment ViewCountFragment on AnalyticsEventCountSummary {
    total
  }
`;
