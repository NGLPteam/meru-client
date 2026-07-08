import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import CoverImage from "@/components/atomic/images/CoverImage";
import { getThumbWithFallback } from "@/helpers";

export default function DetailCoverImage({
  data,
}: {
  data?: FragmentType<typeof fragment> | null;
}) {
  const entity = useFragment(fragment, data);

  const thumbnailData = entity ? getThumbWithFallback(entity) : null;

  const { id, title } = entity ?? {};

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
