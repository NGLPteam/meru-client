import { graphql } from "@/lib/api/gql";

export const detailHeroFragment = graphql(`
  fragment DetailHeroFragment on HeroTemplateInstance {
    entity {
      ...DetailCoverImageFragment
    }
    definition {
      showThumbnailImage
    }
    ...DetailContentFragment
    ...DetailSidebarFragment
  }
`);

export const detailContentFragment = graphql(`
  fragment DetailContentFragment on HeroTemplateInstance {
    entity {
      ... on Item {
        slug
        ...ContributorsListFragment
      }
    }
    definition {
      listContributors
    }
    slots {
      subheader {
        ...sharedInlineSlotFragment
      }
      subheaderSubtitle {
        ...sharedInlineSlotFragment
      }
      subheaderAside {
        ...sharedInlineSlotFragment
      }
      subheaderSummary {
        ...sharedBlockSlotFragment
      }
      metadata {
        ...sharedInlineSlotFragment
      }
      callToAction {
        ...sharedBlockSlotFragment
      }
    }
  }
`);

export const detailSidebarFragment = graphql(`
  fragment DetailSidebarFragment on HeroTemplateInstance {
    entity {
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
      showBasicViewMetrics
    }
    slots {
      sidebar {
        ...sharedBlockSlotFragment
      }
    }
  }
`);

export const detailCoverImageFragment = graphql(`
  fragment DetailCoverImageFragment on Entity {
    __typename
    ... on Collection {
      id
      title
      ...getThumbWithFallbackFragment
    }
    ... on Item {
      id
      title
      ...getThumbWithFallbackFragment
    }
  }
`);
