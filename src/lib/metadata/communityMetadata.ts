import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import type { DocumentType } from "@/lib/api/gql";
import type { communityQuery } from "../queries/community";

// Astro port of app/**/communities/[slug]/_metadata/community.ts. A pure
// function over the community already fetched by communityQuery (no extra
// request); returns an inheritParent PageMeta extending the site defaults.
const BASE_URL = import.meta.env.NEXT_PUBLIC_FE_URL as string | undefined;

type Community = NonNullable<DocumentType<typeof communityQuery>["community"]>;

export default function buildCommunityMeta(
  community: Community,
  slug: string,
): PageMeta {
  const title = community.title ?? undefined;

  const about = community.about;
  const aboutContent =
    about && "content" in about ? (about.content ?? undefined) : undefined;
  const description = aboutContent ? getTruncatedText(aboutContent) : undefined;

  const heroUrl = community.heroImage?.image?.webp?.url;
  const thumbUrl = community.thumbnail?.image?.webp?.url;
  const image = heroUrl
    ? { url: heroUrl, alt: community.heroImageMetadata?.alt ?? "" }
    : thumbUrl
      ? { url: thumbUrl, alt: community.thumbnailMetadata?.alt ?? "" }
      : null;

  return {
    title,
    description,
    url: `${BASE_URL}communities/${slug}`,
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
    inheritParent: true,
  };
}
