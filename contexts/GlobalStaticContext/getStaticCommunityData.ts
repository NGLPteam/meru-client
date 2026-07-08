import { ParsedUrlQuery } from "querystring";
import { graphql, useFragment as readFragment } from "@/lib/api/gql";
import routeQueryArrayToString from "@/helpers/routeQueryArrayToString";
import queryApi from "@/lib/api/queryApi";

export default async function getStaticCommunityData(urlQuery: ParsedUrlQuery) {
  const slug = routeQueryArrayToString(urlQuery?.slug);

  if (!slug) return;

  const { data } = await queryApi(query, { slug });

  if (data?.community) {
    return readFragment(fragment, data.community);
  }
}

const query = graphql(`
  query getStaticCommunityDataQuery($slug: Slug!) {
    community(slug: $slug) {
      ...getStaticCommunityDataFragment
    }
  }
`);

const fragment = graphql(`
  fragment getStaticCommunityDataFragment on Entity {
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
