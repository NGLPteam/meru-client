// useFragment from the client-preset is a pure identity function (not a React
// hook); alias it so it can run in this server-side helper without tripping the
// rules-of-hooks lint.
import { useFragment as readFragment, type FragmentType } from "@/lib/api/gql";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import serverEnv from "../env/serverEnv";
import { communityMetaFragment } from "@/pages/communities/_components/graphql";

const BASE_URL = serverEnv("SITE_URL", "NEXT_PUBLIC_FE_URL");

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
