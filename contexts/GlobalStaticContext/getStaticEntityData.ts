import { graphql, useFragment as readFragment } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";

export default async function getStaticEntityData(slug: string | undefined) {
  if (!slug) return;

  const { data } = await queryApi(query, { slug });

  if (data) {
    return readFragment(
      fragment,
      data.community || data.collection || data.item || null,
    );
  }
}

const query = graphql(`
  query getStaticEntityDataQuery($slug: Slug!) {
    community(slug: $slug) {
      ...getStaticEntityDataFragment
    }
    collection(slug: $slug) {
      ...getStaticEntityDataFragment
    }
    item(slug: $slug) {
      ...getStaticEntityDataFragment
    }
  }
`);

const fragment = graphql(`
  fragment getStaticEntityDataFragment on Entity {
    ... on Entity {
      title
      summary
      thumbnail {
        storage
        medium {
          webp {
            url
            width
            height
          }
        }
      }
      thumbnailMetadata {
        alt
      }
      heroImage {
        storage
        medium {
          webp {
            url
            width
            height
          }
        }
      }
      heroImageMetadata {
        alt
      }
    }
  }
`);
