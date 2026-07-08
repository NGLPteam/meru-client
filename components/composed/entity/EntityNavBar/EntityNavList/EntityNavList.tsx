import { useParams } from "next/navigation";
import {
  graphql,
  useFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers";
import BrowseButton from "./BrowseButton";
import Dropdown from "./Dropdown";
import PagesList from "./PagesList";
import styles from "./EntityNavList.module.css";

export default function EntityNavList({ data }: Props) {
  const { slug } = useParams();
  const entity = useFragment(fragment, data);

  if (!entity || !slug) return null;

  const typeRoute = getRouteByEntityType(entity.__typename);
  const basePath = `/${typeRoute}/${slug}`;

  const orderings = entity.orderings?.nodes || [];
  const pages = entity.pages?.nodes;

  const renderOrderingButton =
    orderings.length === 1 &&
    entity.schemaVersion.identifier !== "journal_issue" &&
    entity.schemaVersion.identifier !== "journal_volume";

  const renderOrderings = renderOrderingButton ? (
    <BrowseButton basePath={basePath} ordering={orderings[0]} />
  ) : orderings.length > 1 ? (
    <Dropdown<Ordering>
      label="nav.browse"
      items={orderings}
      getItemProps={(item) => {
        const context =
          entity.schemaVersion.identifier === "journal" &&
          item.identifier === "articles"
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
      {!!pages?.length && <PagesList pages={pages} basePath={basePath} />}
    </ul>
  );
}

type Props = {
  data?: FragmentType<typeof fragment> | null;
};

type Ordering = DocumentType<typeof fragment>["orderings"]["nodes"][number];

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
