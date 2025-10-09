import { graphql, useFragment } from "react-relay";
import { CoverCardListFragment$key } from "@/relay/CoverCardListFragment.graphql";
import CoverPlaceholder from "@/components/atomic/images/CoverImage/CoverPlaceholder";
import styles from "./Card.module.css";

export default function Cover({
  data,
  ...props
}: ImageProps | PlaceholderProps) {
  const { image } = useFragment(fragment, data) ?? {};

  if (!image || !image.webp.url) {
    return (
      <figure className={styles.figure}>
        <CoverPlaceholder
          seed={"id" in props && props.id ? props.id : "fallback-placeholder"}
          title={"title" in props ? props.title : undefined}
          maxWidth={225}
          maxHeight={300}
        />
      </figure>
    );
  }

  return (
    <figure className={styles.figure}>
      <img
        src={image.webp.url}
        alt={image.webp.alt ?? ""}
        width={225}
        height={300}
        loading={"loading" in props && props.loading ? props.loading : "lazy"}
        decoding="async"
      />
    </figure>
  );
}

interface ImageProps {
  data?: CoverCardListFragment$key | null;
  loading?: "eager" | "lazy";
}

// If a placeholder fallback is requested, this component requires a title and id to
// generate the placeholder
interface PlaceholderProps {
  /* Image fragment */
  data?: CoverCardListFragment$key | null;
  title: string;
  id: string;
}

const fragment = graphql`
  fragment CoverCardListFragment on ImageAttachment {
    image: medium {
      webp {
        url
        alt
        width
        height
      }
    }
  }
`;
