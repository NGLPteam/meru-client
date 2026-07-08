import { useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import IconFactory from "@/components/factories/IconFactory";

export default function DownloadCount({ data }: Props) {
  const summary = useFragment(fragment, data);

  const { t } = useTranslation();

  return summary?.total ? (
    <li className="l-flex l-flex--gap">
      <IconFactory icon="download" role="presentation" />
      <span>{t("metadata.download_count", { count: summary.total })}</span>
    </li>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment DownloadCountFragment on AnalyticsEventCountSummary {
    total
  }
`);
