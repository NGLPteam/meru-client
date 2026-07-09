import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import type { BasePageParams } from "@/types/page";
import { getTruncatedText } from "@/helpers";
import type { PageMeta } from "@/lib/metadata/types";

const BASE_URL = process.env.NEXT_PUBLIC_FE_URL;

export default async function generateCollectionMetadata(
  props: BasePageParams,
): Promise<PageMeta> {
  const { slug } = await props.params;

  const { data } =
    (await queryApi(query, {
      slug,
    })) ?? {};

  const collection = data?.collection;

  const title = collection?.title;

  // TODO: Resolve markdown
  const description = collection?.about?.content
    ? getTruncatedText(collection.about.content)
    : undefined;

  const image = collection?.heroImage?.image?.webp?.url
    ? {
        url: collection.heroImage.image.webp.url,
        alt: collection.heroImageMetadata?.alt ?? "",
      }
    : collection?.thumbnail?.image?.webp?.url
      ? {
          url: collection.thumbnail.image.webp.url,
          alt: collection.thumbnailMetadata?.alt ?? "",
        }
      : null;

  return {
    title: title ?? undefined,
    description,
    url: `${BASE_URL}collections/${slug}`,
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
    inheritParent: true,
  };
}

const query = graphql(`
  query collectionMetadataQuery($slug: Slug!) {
    collection(slug: $slug) {
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
    }
  }
`);
