import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import getEntityVolumeNumber from "./getEntityVolumeNumber";

export default function getEntityDisplayNumber(
  data: FragmentType<typeof fragment>,
) {
  const entity = useFragment(fragment, data);

  const vol = getEntityVolumeNumber(entity);

  const number = entity?.issueNumber?.content;

  return vol ? `Vol. ${vol}, No. ${number}` : number ? `No. ${number}` : null;
}

const fragment = graphql(`
  fragment getEntityDisplayNumberFragment on Entity {
    ... on Collection {
      issueNumber: schemaProperty(fullPath: "number") {
        ... on StringProperty {
          content
        }
      }
      ...getEntityVolumeNumberFragment
    }
  }
`);
