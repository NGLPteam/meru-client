import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { getRouteByEntityType } from "@/helpers/routes";

export const hrefFromTypename = (
  data?: FragmentType<typeof fragment> | null,
) => {
  if (!data) return null;

  const { entry, entrySlug } = useFragment(fragment, data);

  switch (entry.__typename) {
    case "Collection":
    case "Item":
    case "Community":
      return `/${getRouteByEntityType(entry.__typename)}/${entrySlug}`;
    case "EntityLink":
      return `/${getRouteByEntityType(entry.target.__typename)}/${entrySlug}`;
    default:
      return null;
  }
};

const fragment = graphql(`
  fragment routesOrderingTemplateFragment on OrderingEntry {
    entrySlug
    entry {
      ... on Collection {
        __typename
      }
      ... on Item {
        __typename
      }
      ... on Community {
        __typename
      }
      ... on EntityLink {
        __typename
        target {
          ... on Collection {
            __typename
          }
          ... on Item {
            __typename
          }
          ... on Community {
            __typename
          }
        }
      }
    }
  }
`);
