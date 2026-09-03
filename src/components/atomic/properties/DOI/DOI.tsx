import { t } from "@/lib/i18n";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export default function DOI({ data }: Props) {
  const { doiData } = useFragment(fragment, data) ?? {};

  const { doi, url } = doiData ?? {};

  if (!doi) return null;

  return (
    <li className="l-flex l-flex--gap-sm">
      <span>{t("metadata.doi")}</span>
      {url ? (
        <a
          target="_blank"
          rel="noreferrer"
          href={url}
          className="a-link"
          aria-label={t("metadata.doi_link")}
        >
          {doi}
          <span className="sr-only">{t("common.opens_new_window")}</span>
        </a>
      ) : (
        <span>{doi}</span>
      )}
    </li>
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment DOIFragment on HasDOI {
    doiData {
      doi
      url
    }
  }
`);
