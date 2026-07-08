import { useTranslation } from "react-i18next";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import classNames from "classnames";
import useRouteSlug from "@/hooks/useRouteSlug";
import NamedLink from "@/components/atomic/links/NamedLink";
import ReadMoreLink from "@/components/atomic/links/Link/patterns/ReadMoreLink";
import styles from "./Announcements.module.css";

export default function EntityAnnouncements({ data }: Props) {
  const announcements = useFragment<FragmentType<typeof fragment>>(fragment, data);

  const { t } = useTranslation();

  const slug = useRouteSlug();

  return !!announcements.nodes.length && slug ? (
    <aside className={classNames("a-bg-neutral00", styles.block)}>
      <h4 className={styles.header}>{t("layouts.announcements_header")}</h4>
      <ul className="t-unstyled-list">
        {announcements.nodes.map((announcement) => (
          <li className={styles.item} key={announcement.slug}>
            <h5 className="t-copy-medium">
              <NamedLink
                href={`/collections/${slug}/announcements/${announcement.slug}`}
              >
                <span>{announcement.header}</span>
              </NamedLink>
            </h5>
            <div className={classNames("t-rte", styles.itemContent)}>
              <p>{announcement.teaser}</p>
            </div>
            <NamedLink
              href={`/collections/${slug}/announcements/${announcement.slug}`}
            >
              <ReadMoreLink className="t-label-mix" />
            </NamedLink>
          </li>
        ))}
      </ul>
    </aside>
  ) : null;
}

interface Props {
  data: FragmentType<typeof fragment>;
}

const fragment = graphql(`
  fragment AnnouncementsFragment on AnnouncementConnection {
    nodes {
      teaser
      header
      slug
    }
  }
`);
