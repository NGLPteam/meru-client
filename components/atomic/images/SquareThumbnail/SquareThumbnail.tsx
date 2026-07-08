import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import SquareThumbnailBase from "./SquareThumbnailBase";

type BaseProps = React.ComponentProps<typeof SquareThumbnailBase>;

type ImageProps = Pick<BaseProps, "size">;

export default function SquareThumbnail({
  data,
  ...props
}: Props & ImageProps) {
  const imageData = useFragment(fragment, data);
  const image = imageData?.thumb?.webp;

  return image ? (
    <SquareThumbnailBase {...props} alt={image.alt} url={image.url} />
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

const fragment = graphql(`
  fragment SquareThumbnailFragment on ImageAttachment {
    thumb: medium {
      webp {
        alt
        url
      }
    }
  }
`);
