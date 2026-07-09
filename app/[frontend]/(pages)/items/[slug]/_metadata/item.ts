import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import type { BasePageParams } from "@/types/page";
import { getTruncatedText } from "@/helpers";
import type { PageMeta } from "@/lib/metadata/types";

const BASE_URL = process.env.NEXT_PUBLIC_FE_URL;

export default async function generateItemMetadata(
  props: BasePageParams,
): Promise<PageMeta> {
  const { slug } = await props.params;

  const { data } =
    (await queryApi(query, {
      slug,
    })) ?? {};

  const item = data?.item;

  const title = item?.title;

  // TODO: Resolve markdown
  const description = item?.about?.content
    ? getTruncatedText(item.about.content)
    : undefined;

  const image = item?.heroImage?.image?.webp?.url
    ? {
        url: item.heroImage.image.webp.url,
        alt: item.heroImageMetadata?.alt ?? "",
      }
    : item?.thumbnail?.image?.webp?.url
      ? {
          url: item.thumbnail.image.webp.url,
          alt: item.thumbnailMetadata?.alt ?? "",
        }
      : null;

  return {
    title: title ?? undefined,
    description,
    url: `${BASE_URL}items/${slug}`,
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
    inheritParent: true,
  };
}

const query = graphql(`
  query itemMetadataQuery($slug: Slug!) {
    item(slug: $slug) {
      title
      heroImage {
        image: large {
          webp {
            url
          }
        }
      }
      heroImageMetadata {
        alt
      }
      thumbnail {
        image: large {
          webp {
            url
          }
        }
      }
      thumbnailMetadata {
        alt
      }
      about: schemaProperty(fullPath: "about") {
        ... on MarkdownProperty {
          content
        }
      }
      abstract: schemaProperty(fullPath: "abstract") {
        ... on FullTextProperty {
          fullText {
            content
          }
        }
      }
    }
  }
`);
