import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { FileThumbnail, NamedLink } from "@/components/atomic";
import styles from "./AssetThumbnail.module.css";

export default function AssetThumbnail({ data, slug }: Props) {
  const asset = useFragment(fragment, data);
  const image = asset?.preview?.storage ? asset.preview.image?.webp : null;

  function renderThumbnail() {
    return asset ? (
      <FileThumbnail
        alt={image && asset.altText}
        url={image?.url}
        kind={asset.kind}
      />
    ) : null;
  }

  return asset?.slug && slug ? (
    <NamedLink
      className={styles.imageLink}
      href={`/items/${slug}/files/${asset.slug}`}
    >
      {renderThumbnail()}
    </NamedLink>
  ) : (
    renderThumbnail()
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  // The owning item's slug — the thumbnail links into its files route.
  slug?: string;
}

const fragment = graphql(`
  fragment AssetThumbnailFragment on Asset {
    kind
    slug
    altText
    preview {
      storage
      image: small {
        webp {
          alt
          url
        }
      }
    }
  }
`);
