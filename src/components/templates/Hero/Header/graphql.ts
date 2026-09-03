import { graphql } from "@/lib/api/gql";

export const headerHeroFragment = graphql(`
  fragment HeaderHeroFragment on HeroTemplateInstance {
    definition {
      showSplitDisplay
    }
    ...HeaderSidebarFragment
    ...HeaderTitleBlockFragment
  }
`);

export const headerTitleBlockFragment = graphql(`
  fragment HeaderTitleBlockFragment on HeroTemplateInstance {
    entity {
      ... on Community {
        ...ContributorsListFragment
      }
      ... on Item {
        ...ContributorsListFragment
      }
      ... on Collection {
        id
        slug
        title
        ...ContributorsListFragment
        thumbnail {
          storage
          medium {
            webp {
              width
              height
            }
          }
          ...CoverImageFragment
        }
      }
    }
    definition {
      listContributors
      showThumbnailImage
      showSplitDisplay
    }
    slots {
      header {
        ...sharedInlineSlotFragment
      }
      headerSubtitle {
        ...sharedInlineSlotFragment
      }
      headerParent {
        ...sharedInlineSlotFragment
      }
      headerAside {
        ...sharedInlineSlotFragment
      }
      headerSummary {
        ...sharedBlockSlotFragment
      }
      callToAction {
        ...sharedBlockSlotFragment
      }
    }
  }
`);

export const headerSidebarFragment = graphql(`
  fragment HeaderSidebarFragment on HeroTemplateInstance {
    entity {
      ... on HasDOI {
        doiData {
          doi
        }
      }
      ...DOIFragment
      ... on Item {
        entityViews {
          ...ViewCountFragment
        }
        assetDownloads {
          ...DownloadCountFragment
        }
      }
      ... on Collection {
        entityViews {
          ...ViewCountFragment
        }
      }
    }
    definition {
      showDOI
      showBasicViewMetrics
      showSplitDisplay
    }
    slots {
      headerSidebar {
        ...sharedBlockSlotFragment
      }
    }
  }
`);
