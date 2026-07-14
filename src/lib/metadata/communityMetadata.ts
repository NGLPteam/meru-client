// useFragment from the client-preset is a pure identity function (not a React
// hook); alias it so it can run in this server-side helper without tripping the
// rules-of-hooks lint.
import { useFragment as readFragment, type FragmentType } from "@/lib/api/gql";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import { communityMetaFragment } from "../queries/community";

// Astro port of app/**/communities/[slug]/_metadata/community.ts. A pure
// function over the community already fetched by the page (no extra request);
// returns an inheritParent PageMeta extending the site defaults.
const BASE_URL = import.meta.env.NEXT_PUBLIC_FE_URL as string | undefined;

export default function buildCommunityMeta(
  data: FragmentType<typeof communityMetaFragment>,
  slug: string,
): PageMeta {
  const community = readFragment(communityMetaFragment, data);

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
