import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";

export default function getThumbWithFallback(
  data: FragmentType<typeof fragment>,
) {
  const entity = useFragment(fragment, data);

  const { thumbnail, breadcrumbs } = entity;

  if (thumbnail?.image?.webp?.url) return { thumbnail, hasThumb: true };

  const fallback = breadcrumbs?.findLast(
    ({ crumb }) => !!crumb?.thumbnail?.image?.webp?.url,
  );

  if (fallback) return { thumbnail: fallback.crumb.thumbnail, hasThumb: true };

  // Placeholder will render but make sure to return CoverImageFragment
  return { thumbnail, hasThumb: false };
}

const fragment = graphql(`
  fragment getThumbWithFallbackFragment on Entity {
    ... on Collection {
      thumbnail {
        image: medium {
          webp {
            url
          }
        }
        ...CoverImageFragment
        ...CoverCardListFragment
      }
      breadcrumbs {
        crumb {
          ... on Collection {
            thumbnail {
              image: medium {
                webp {
                  url
                }
              }
              ...CoverImageFragment
              ...CoverCardListFragment
            }
          }
        }
      }
    }
    ... on Item {
      thumbnail {
        image: medium {
          webp {
            url
          }
        }
        ...CoverImageFragment
        ...CoverCardListFragment
      }
      breadcrumbs {
        crumb {
          ... on Collection {
            thumbnail {
              image: medium {
                webp {
                  url
                }
              }
              ...CoverImageFragment
              ...CoverCardListFragment
            }
          }
          ... on Item {
            thumbnail {
              image: medium {
                webp {
                  url
                }
              }
              ...CoverImageFragment
              ...CoverCardListFragment
            }
          }
        }
      }
    }
  }
`);
