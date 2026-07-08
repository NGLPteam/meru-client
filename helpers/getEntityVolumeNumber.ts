import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export default function getEntityVolumeNumber(
  data: FragmentType<typeof fragment>,
) {
  const entity = useFragment(fragment, data);

  return entity?.vol?.number?.content
    ? entity.vol.number.content
    : entity?.volumeNumber?.content;
}

const fragment = graphql(`
  fragment getEntityVolumeNumberFragment on Entity {
    ... on Collection {
      vol: ancestorByName(name: "volume") {
        ... on Collection {
          number: schemaProperty(fullPath: "id") {
            ... on StringProperty {
              content
            }
          }
        }
      }
      volumeNumber: schemaProperty(fullPath: "volume.id") {
        ... on StringProperty {
          content
        }
      }
    }
  }
`);
