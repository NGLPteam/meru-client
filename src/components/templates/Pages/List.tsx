import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { NamedLink } from "@/components/atomic";
import styles from "./Pages.module.css";

export default function List({
  data,
}: {
  data?: FragmentType<typeof fragment> | null;
}) {
  const { slug, pages } = useFragment(fragment, data) ?? {};

  const canRender =
    !!pages?.edges?.length && pages.edges.some((e) => !!e.node.slug);

  if (!canRender) return null;

  return (
    slug && (
      <ul className={styles.list}>
        {pages.edges.map((p) =>
          p.node.slug ? (
            <li className={styles.item} key={p.node.slug}>
              <NamedLink href={`/collections/${slug}/page/${p.node.slug}`}>
                <span className="t-label-sm t-copy-light">{p.node.title}</span>
              </NamedLink>
            </li>
          ) : null,
        )}
      </ul>
    )
  );
}

const fragment = graphql(`
  fragment ListPagesTemplateFragment on Entity {
    ... on Sluggable {
      slug
    }
    ... on Item {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
    ... on Collection {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
    ... on Community {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
  }
`);
