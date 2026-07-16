"use client";

import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { formatDate } from "@/helpers/dates";
import { Markdown } from "@/components/atomic";
import styles from "./EntityAnnouncementLayout.module.css";

export default function EntityAnnouncementLayout({ data }: Props) {
  const announcement = useFragment(fragment, data);
  const { t } = useTranslation();

  return announcement ? (
    <div
      className={classNames(
        styles.wrapper,
        "t-rte l-container-wide a-bg-neutral00",
      )}
    >
      <h3>{announcement.header}</h3>
      {announcement.updatedAt && (
        <p>
          {t("common.last_updated", {
            value: formatDate(announcement.updatedAt, "L/d/yy"),
          })}
        </p>
      )}
      {!announcement.updatedAt && announcement.publishedOn && (
        <p>
          {t("common.last_updated", {
            value: formatDate(announcement.publishedOn, "L/d/yy"),
          })}
        </p>
      )}
      <Markdown.Base className="t-rte">{announcement.body}</Markdown.Base>
    </div>
  ) : null;
}

interface Props {
  /* Item data */
  data?: FragmentType<typeof fragment> | null;
  /* Child page content */
  children?: React.ReactNode;
}

const fragment = graphql(`
  fragment EntityAnnouncementLayoutFragment on Announcement {
    header
    body
    publishedOn
    updatedAt
  }
`);
