import { useMemo } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { pxToRem } from "@/helpers/theme";
import { NamedLink } from "@/components/atomic";
import styles from "./CommunityLogo.module.css";

const SIZE = 40;

export default function CommunityLogo({ data, slug }: Props) {
  const logo = useFragment(fragment, data);

  const image = useMemo(() => (logo?.storage ? logo.original : null), [logo]);

  const width = image?.width || 1;
  const height = image?.height || 1;

  return image && image.url ? (
    <NamedLink href={`/communities/${slug}`}>
      <span>
        <figure
          style={{
            width: (SIZE * width) / height,
            height: pxToRem(SIZE),
            minWidth: pxToRem(SIZE),
          }}
          className={styles.logo}
        >
          <img
            alt={image.alt ?? ""}
            src={image.url}
            width={image.width || SIZE}
            height={image.height || SIZE}
          />
        </figure>
      </span>
    </NamedLink>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  slug?: string;
}

const fragment = graphql(`
  fragment CommunityLogoFragment on ImageAttachment {
    storage
    original {
      url
      alt
      width
      height
    }
  }
`);
