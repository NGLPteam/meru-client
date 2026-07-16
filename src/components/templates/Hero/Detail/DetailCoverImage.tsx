import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import CoverImage from "@/components/atomic/images/CoverImage";
import { getThumbWithFallback } from "@/helpers";

export default function DetailCoverImage({
  data,
}: {
  data?: FragmentType<typeof fragment> | null;
}) {
  const entity = useFragment(fragment, data);

  const narrowedEntity = entity && "id" in entity ? entity : null;

  const thumbnailData = narrowedEntity
    ? getThumbWithFallback(narrowedEntity)
    : null;

  const { id, title } = narrowedEntity ?? {};

  return (
    <CoverImage
      maxWidth={225}
      maxHeight={300}
      data={thumbnailData?.thumbnail}
      id={id}
      title={title}
    />
  );
}

const fragment = graphql(`
  fragment DetailCoverImageFragment on Entity {
    __typename
    ... on Collection {
      id
      title
      ...getThumbWithFallbackFragment
    }
    ... on Item {
      id
      title
      ...getThumbWithFallbackFragment
    }
  }
`);
