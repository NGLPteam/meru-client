import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import type { HeroImageLayout } from "@/types/graphql-schema";
import { generateSrcSet, sizes } from "@/helpers/generateSrcSet";
import type { ImageSize } from "@/types/graphql-schema";
import styles from "./Image.module.css";

export default function HeroImage({
  data,
  layout,
}: {
  data: FragmentType<typeof fragment> | null;
  layout?: HeroImageLayout;
}) {
  const images = useFragment(fragment, data);

  const { url, alt, height, width } = images?.hero?.webp ?? {};

  return images && url ? (
    <div
      className={
        layout
          ? classNames(styles.gridWrapper, {
              [styles["gridWrapper--two-column"]]: layout === "TWO_COLUMN",
            })
          : styles.baseWrapper
      }
    >
      <img
        alt={alt ?? ""}
        src={url}
        srcSet={generateSrcSet(images as unknown as Record<string, ImageSize>)}
        sizes={sizes}
        height={height ?? 425}
        width={width ?? 585}
        className={classNames(styles.image, {
          [styles["image--one-column"]]: layout === "ONE_COLUMN",
        })}
        decoding="async"
        loading="eager"
      />
    </div>
  ) : null;
}

const fragment = graphql(`
  fragment ImageHeroTemplateFragment on ImageAttachment {
    hero {
      webp {
        url
        alt
        width
        height
      }
    }
    large {
      webp {
        url
        width
      }
    }
    medium {
      webp {
        url
        width
      }
    }
  }
`);
