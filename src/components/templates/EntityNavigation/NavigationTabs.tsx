import { useTranslation } from "react-i18next";
import classNames from "classnames";
import { useParams, usePathname } from "@/lib/routing/hooks";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import NamedLink from "@/components/atomic/links/NamedLink";
import { useSharedInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import type { TemplateSlotInlineInstance } from "@/types/graphql-schema";
import { getRouteByEntityType } from "@/helpers/routes";
import { useFullTextCheck } from "../FullTextCheck/FullTextCheck";
import styles from "./EntityNavigation.module.css";

export default function NavigationTabs({
  data,
  slug: slugProp,
  pathname: pathnameProp,
  renderMainLayout: renderMainLayoutProp,
}: {
  data?: FragmentType<typeof fragment> | null;
  // Rendered statically from an .astro shell these arrive as props; inside
  // legacy content islands they come from route context / FullTextCheck.
  slug?: string;
  pathname?: string;
  renderMainLayout?: boolean;
}) {
  const { slug: routeSlug } = useParams();
  const routePathname = usePathname();
  const { t } = useTranslation();

  const slug = slugProp ?? routeSlug;
  const pathname = pathnameProp ?? routePathname;

  const template = useFragment(fragment, data);

  const { slots, entity, definition } = template ?? {};

  const entityLabel = useSharedInlineFragment(slots?.entityLabel);

  const contextRenderMainLayout = useFullTextCheck();
  const renderMainLayout = renderMainLayoutProp ?? contextRenderMainLayout;

  if (!entity || (entity.__typename as string) === "%other") return null;

  const basePath = `/${getRouteByEntityType(entity.__typename)}/${slug}`;

  const getLink = (
    href: string,
    label?: TemplateSlotInlineInstance | string | null,
  ) => {
    const isCurrent = pathname === href;

    const renderedLabel =
      typeof label === "string"
        ? t(label)
        : label?.valid
          ? label?.content
          : t("glossary.item");

    return renderedLabel ? (
      <li className={styles.item} key={href}>
        <NamedLink href={href} scroll={false}>
          <span
            className={styles.tab}
            aria-current={isCurrent ? "page" : undefined}
          >
            {renderedLabel}
          </span>
        </NamedLink>
      </li>
    ) : null;
  };

  return (
    <nav
      className={classNames("l-container-wide", styles.nav)}
      aria-label={t("nav.content_navigation_label")}
    >
      <ul className={styles.list}>
        {renderMainLayout && getLink(basePath, entityLabel)}
        {!definition?.hideMetadata &&
          getLink(`${basePath}/metadata`, "nav.metadata")}
        {entity.assets?.pageInfo.totalCount > 0 &&
          getLink(`${basePath}/files`, "nav.files")}
        {"contributions" in entity &&
          entity.contributions?.pageInfo.totalCount > 0 &&
          getLink(`${basePath}/contributors`, "nav.contributors")}
        {entity.__typename === "Item" &&
          getLink(`${basePath}/metrics`, "nav.metrics")}
        {entity.pages && entity.pages.edges.length > 0
          ? entity.pages.edges.map(({ node }) =>
              getLink(`${basePath}/page/${node.slug}`, node.title),
            )
          : null}
      </ul>
    </nav>
  );
}

const fragment = graphql(`
  fragment NavigationTabsFragment on NavigationTemplateInstance {
    entity {
      ... on Item {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        contributions {
          pageInfo {
            totalCount
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
      ... on Collection {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        contributions {
          pageInfo {
            totalCount
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
      ... on Community {
        __typename
        pages {
          edges {
            node {
              title
              slug
            }
          }
        }
        assets {
          pageInfo {
            totalCount
          }
        }
      }
    }
    definition {
      hideMetadata
    }
    slots {
      entityLabel {
        ...sharedInlineSlotFragment
      }
    }
  }
`);
