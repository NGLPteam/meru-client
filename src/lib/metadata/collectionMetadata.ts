// useFragment is a pure identity function (not a hook); alias it so it runs in
// this server-side helper without tripping rules-of-hooks.
import { useFragment, type FragmentType } from "@/lib/api/gql";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import serverEnv from "../env/serverEnv";
import { collectionMetaFragment } from "@/pages/collections/_components/graphql";

const BASE_URL = serverEnv("SITE_URL");

export default function buildCollectionMeta(
  data: FragmentType<typeof collectionMetaFragment>,
  slug: string,
): PageMeta {
  const collection = useFragment(collectionMetaFragment, data);

  const title = collection.title ?? undefined;

  const about = collection.about;
  const aboutContent =
    about && "content" in about ? (about.content ?? undefined) : undefined;
  const description = aboutContent ? getTruncatedText(aboutContent) : undefined;

  const heroUrl = collection.heroImage?.image?.webp?.url;
  const thumbUrl = collection.thumbnail?.image?.webp?.url;
  const image = heroUrl
    ? { url: heroUrl, alt: collection.heroImageMetadata?.alt ?? "" }
    : thumbUrl
      ? { url: thumbUrl, alt: collection.thumbnailMetadata?.alt ?? "" }
      : null;

  return {
    title,
    description,
    url: `${BASE_URL}collections/${slug}`,
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
    inheritParent: true,
  };
}
