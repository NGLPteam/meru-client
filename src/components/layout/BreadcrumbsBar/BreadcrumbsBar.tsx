"use client";

import { useMemo } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import capitalize from "lodash/capitalize";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { Breadcrumbs, Button, Dropdown } from "@/components/atomic";
import { getOrigin, getRouteByEntityType } from "@/helpers";
import { ADMIN_URL } from "@/lib/env/clientConfig";
import { useGlobalStaticContext } from "@/contexts/GlobalStaticContext";
import styles from "./BreadcrumbsBar.module.css";

export default function BreadcrumbsBar({
  data,
  showShare = true,
  className,
}: Props) {
  const breadcrumbData = useFragment(fragment, data);

  const { t } = useTranslation();

  const globalData = useGlobalStaticContext();

  const url = useMemo(() => {
    if (!breadcrumbData) return null;

    const { slug, __typename: type, permalinks } = breadcrumbData;

    const origin = getOrigin();

    if (permalinks?.length) {
      const canonical = permalinks.find((p) => p.canonical);

      if (canonical) return `${origin}/permalink/${canonical.uri}`;
    }

    const route = getRouteByEntityType(type);

    if (!route || !origin || !slug) return null;

    return `${origin}/${route}/${slug}`;
  }, [breadcrumbData]);

  const installation =
    globalData?.globalConfiguration?.site?.installationName || "WDP";

  return breadcrumbData ? (
    <nav className={classNames(className ?? "a-bg-custom10", styles.outer)}>
      <div className={classNames("l-container-wide", styles.inner)}>
        <Breadcrumbs data={breadcrumbData} />
        <div className={styles.buttons}>
          {breadcrumbData.submissionTarget?.state === "OPEN" && (
            <Button
              as="a"
              size="sm"
              icon="linkExternal"
              href={`${ADMIN_URL}my-submissions/new?collection=${breadcrumbData.slug}`}
              target="_blank"
              secondary
            >
              {t("submission.submit_to", {
                target: breadcrumbData.schemaVersion?.identifier
                  ? capitalize(breadcrumbData.schemaVersion.identifier)
                  : t("submission.default_target"),
              })}
            </Button>
          )}
          {showShare && (
            <Dropdown
              label={t("share.label")}
              disclosure={
                <Button as="div" size="sm" icon="share" secondary>
                  {t("share.label")}
                </Button>
              }
              menuItems={[
                <Dropdown.Link
                  key="email"
                  href={`mailto:?subject=${breadcrumbData.title} - ${installation}&body=View ${breadcrumbData.title} published on ${installation}.%0d%0a%0d%0a${url}`}
                  icon="email"
                  iconLeft
                  label={t("share.email")}
                  className={classNames(styles.shareLink, "share-link")}
                />,
                <Dropdown.Link
                  key="fb"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                  icon="facebook"
                  iconLeft
                  label={t("share.facebook")}
                  className={classNames(styles.shareLink, "share-link")}
                />,
                <Dropdown.Link
                  key="x"
                  href={`https://x.com/share?text=&url=${url}`}
                  icon="x"
                  iconLeft
                  label={t("share.x")}
                  className={classNames(styles.shareLink, "share-link")}
                />,
              ]}
            />
          )}
        </div>
      </div>
    </nav>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  showShare?: boolean;
  className?: string;
}

const fragment = graphql(`
  fragment BreadcrumbsBarFragment on Entity {
    __typename
    title
    ... on Sluggable {
      slug
    }
    ... on Permalinkable {
      permalinks {
        canonical
        uri
      }
    }
    schemaVersion {
      name
      identifier
    }
    submissionTarget {
      state
    }
    ...BreadcrumbsFragment
  }
`);
