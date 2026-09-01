import { graphql, type DocumentType } from "@/lib/api/gql";
import BrowseButton from "./BrowseButton";
import Dropdown from "./Dropdown";
import PagesList from "./PagesList";
import styles from "./EntityNavList.module.css";

type NavListData = DocumentType<typeof fragment>;
type Ordering = NavListData["orderings"]["nodes"][number];

// Plain props (extracted server-side by getEntityNavBarData) — see the
// EntityNavBar header comment for why this island doesn't take fragment refs.
export default function EntityNavList({
  basePath,
  schemaIdentifier,
  orderings,
  pages,
  pathname,
}: Props) {
  const renderOrderingButton =
    orderings.length === 1 &&
    schemaIdentifier !== "journal_issue" &&
    schemaIdentifier !== "journal_volume";

  const renderOrderings = renderOrderingButton ? (
    <BrowseButton basePath={basePath} ordering={orderings[0]} />
  ) : orderings.length > 1 ? (
    <Dropdown<Ordering>
      label="nav.browse"
      items={orderings}
      getItemProps={(item) => {
        const context =
          schemaIdentifier === "journal" && item.identifier === "articles"
            ? "ABBR"
            : "NONE";

        return {
          href: `${basePath}/browse/${item.identifier}?context=${context}`,
          label: `${item.name} (${item.count})`,
          scroll: false,
        };
      }}
    />
  ) : null;

  return (
    <ul className={styles.list}>
      {renderOrderings}
      {!!pages?.length && (
        <PagesList pages={pages} basePath={basePath} pathname={pathname} />
      )}
    </ul>
  );
}

type Props = {
  basePath: string;
  schemaIdentifier: string;
  orderings: NavListData["orderings"]["nodes"];
  pages: NavListData["pages"]["nodes"];
  pathname?: string;
};

export const fragment = graphql(`
  fragment EntityNavListFragment on Entity {
    __typename
    schemaVersion {
      name
      identifier
    }
    orderings(availability: ENABLED) {
      nodes {
        name
        slug
        identifier
        count
      }
    }
    pages {
      nodes {
        title
        slug
      }
    }
  }
`);
