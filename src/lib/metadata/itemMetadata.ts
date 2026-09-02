// useFragment is a pure identity function (not a hook); alias it so it runs in
// this server-side helper without tripping rules-of-hooks.
import { useFragment, type FragmentType } from "@/lib/api/gql";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import serverEnv from "../env/serverEnv";
import { itemMetaFragment } from "@/pages/items/_components/graphql";

const BASE_URL = serverEnv("SITE_URL", "NEXT_PUBLIC_FE_URL");

export default function buildItemMeta(
  data: FragmentType<typeof itemMetaFragment>,
  slug: string,
): PageMeta {
  const item = useFragment(itemMetaFragment, data);

  const title = item.title ?? undefined;

  const about = item.about;
  const aboutContent =
    about && "content" in about ? (about.content ?? undefined) : undefined;
  const description = aboutContent ? getTruncatedText(aboutContent) : undefined;

  const heroUrl = item.heroImage?.image?.webp?.url;
  const thumbUrl = item.thumbnail?.image?.webp?.url;
  const image = heroUrl
    ? { url: heroUrl, alt: item.heroImageMetadata?.alt ?? "" }
    : thumbUrl
      ? { url: thumbUrl, alt: item.thumbnailMetadata?.alt ?? "" }
      : null;

  return {
    title,
    description,
    url: `${BASE_URL}items/${slug}`,
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
    inheritParent: true,
  };
}
