// useFragment is a pure identity function (not a hook); alias it so it runs in
// this server-side helper without tripping rules-of-hooks.
import { useFragment as readFragment, type FragmentType } from "@/lib/api/gql";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import { collectionMetaFragment } from "../queries/collection";

// Astro port of app/**/collections/[slug]/_metadata/collection.ts.
const BASE_URL = import.meta.env.NEXT_PUBLIC_FE_URL as string | undefined;

export default function buildCollectionMeta(
  data: FragmentType<typeof collectionMetaFragment>,
  slug: string,
): PageMeta {
  const collection = readFragment(collectionMetaFragment, data);

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
