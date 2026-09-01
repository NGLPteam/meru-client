"use client";

// Hydrated island mounted from the .astro entity shells. Takes the plain data
// shape produced by getEntityNavBarData (extracted server-side) rather than a
// fragment ref: the fragment's fields live merged into the full entity object,
// so passing a fragment ref would serialize the entire entity — full-text body
// included — into the island's props.
import "@/i18n";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { markdownToTxt } from "markdown-to-txt";
import { usePathname } from "@/lib/routing/hooks";
import {
  graphql,
  useFragment as readFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers";
import { templateSlotInlineFragment } from "@/components/templates/shared/shared.slots.graphql";
import { fragment as entityNavListFragment } from "./EntityNavList/EntityNavList";
import { Search } from "@/components/forms";
import EntityNavList from "./EntityNavList";
import styles from "./EntityNavBar.module.css";

type NavListData = DocumentType<typeof entityNavListFragment>;

export type EntityNavBarData = {
  slug: string;
  title: string;
  basePath: string;
  enableDescendantBrowsing: boolean;
  enableDescendantSearch: boolean;
  // Search placeholder from the descendantSearchPrompt slot, already reduced
  // to plain text server-side (markdown stripped); null → t() fallback.
  searchPrompt: string | null;
  schemaIdentifier: string;
  orderings: NavListData["orderings"]["nodes"];
  pages: NavListData["pages"]["nodes"];
};

// Server-side extraction for the .astro shells (readFragment is codegen's
// identity unmask — not a hook).
export function getEntityNavBarData(
  data?: FragmentType<typeof fragment> | null,
): EntityNavBarData | null {
  const entity = readFragment(fragment, data);
  if (!entity || !entity.slug || !entity.title) return null;

  const { enableDescendantSearch, enableDescendantBrowsing } =
    entity.layouts?.hero?.template?.definition ?? {};

  const prompt = readFragment(
    templateSlotInlineFragment,
    entity.layouts?.hero?.template?.slots.descendantSearchPrompt,
  );

  const navList = readFragment(entityNavListFragment, entity);

  return {
    slug: entity.slug,
    title: entity.title,
    basePath: `/${getRouteByEntityType(navList.__typename)}/${entity.slug}`,
    enableDescendantBrowsing: !!enableDescendantBrowsing,
    enableDescendantSearch: !!enableDescendantSearch,
    searchPrompt:
      prompt?.valid && prompt.content ? markdownToTxt(prompt.content) : null,
    schemaIdentifier: navList.schemaVersion.identifier,
    orderings: navList.orderings?.nodes ?? [],
    pages: navList.pages?.nodes ?? [],
  };
}

export default function EntityNavBar({ data, pathname: pathnameProp }: Props) {
  const { t } = useTranslation();

  const routePathname = usePathname();
  const pathname = pathnameProp ?? routePathname;
  const hideSearch = pathname.includes("search");

  const canRender =
    !!data && (data.enableDescendantSearch || data.enableDescendantBrowsing);

  if (!canRender) return null;

  const placeholder =
    data.searchPrompt ??
    t("search.placeholder_name", {
      name: data.title,
    });

  return (
    <nav className={classNames("a-bg-custom20", styles.nav)}>
      <div className={classNames("l-container-wide", styles.inner)}>
        <div className={styles.left}>
          {data.enableDescendantBrowsing && (
            <EntityNavList
              basePath={data.basePath}
              schemaIdentifier={data.schemaIdentifier}
              orderings={data.orderings}
              pages={data.pages}
              pathname={pathname}
            />
          )}
        </div>
        {!hideSearch && (
          <div className={styles.right}>
            {data.enableDescendantSearch && (
              <Search
                pathname={`/collections/${data.slug}/search`}
                id="entitySearch"
                placeholder={placeholder}
              />
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

type Props = {
  data?: EntityNavBarData | null;
  pathname?: string;
};

const fragment = graphql(`
  fragment EntityNavBarFragment on Entity {
    ... on Node {
      id
    }
    ... on Sluggable {
      slug
    }
    ... on Entity {
      title
      ...EntityNavListFragment
      layouts {
        hero {
          template {
            definition {
              enableDescendantBrowsing
              enableDescendantSearch
            }
            slots {
              descendantSearchPrompt {
                ...sharedInlineSlotFragment
              }
            }
          }
        }
      }
    }
  }
`);
