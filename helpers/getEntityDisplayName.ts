import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import getEntityVolumeNumber from "./getEntityVolumeNumber";

export default function getEntityDisplayName(
  data: FragmentType<typeof fragment>,
) {
  const entity = useFragment(fragment, data);

  const vol = getEntityVolumeNumber(entity);

  if (!entity || !("title" in entity)) return null;

  const volTitle = entity.vol?.title
    ? entity.vol.title
    : vol
      ? `Volume ${vol}`
      : null;

  const number = entity.issueNumber?.content;
  const entityTitle = entity.title
    ? entity.title
    : number
      ? `Issue ${number}`
      : null;

  return volTitle ? `${volTitle}, ${entityTitle}` : entityTitle;
}

const fragment = graphql(`
  fragment getEntityDisplayNameFragment on Entity {
    ... on Collection {
      title
      vol: ancestorByName(name: "volume") {
        ... on Collection {
          title
        }
      }
      issueNumber: schemaProperty(fullPath: "number") {
        ... on StringProperty {
          content
        }
      }
    }

    ...getEntityVolumeNumberFragment
  }
`);
