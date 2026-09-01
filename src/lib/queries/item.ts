import { graphql } from "@/lib/api/gql";

// Shared item shell selection (hero + view counter target + entity nav +
// processing check + full-text check + inline navigation template), reused by
// the detail page and every sub-route. `community` (parent community for the
// header context), metadata, and the Google Scholar head data are spread
// directly on each query so the .astro can read them unmasked.
export const itemShellFragment = graphql(`
  fragment ItemShellFragment on Item {
    canPreview {
      value
    }
    layouts {
      hero {
        ...HeroTemplateFragment
      }
      navigation {
        ...EntityNavigationTemplateFragment
      }
      ...ProcessingCheckFragment
      ...FullTextCheckFragment
    }
    ...SearchButtonFragment
    ...EntityNavBarFragment
  }
`);

export const itemMetaFragment = graphql(`
  fragment ItemMetaFragment on Item {
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
`);

export const itemQuery = graphql(`
  query itemQuery($slug: Slug!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      layouts {
        main {
          ...MainLayoutFragment
        }
      }
    }
  }
`);

export const itemPageQuery = graphql(`
  query itemPageQuery($slug: Slug!, $pageSlug: String!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      page(slug: $pageSlug) {
        ...EntityPageLayoutFragment
      }
    }
  }
`);

export const itemContributorsQuery = graphql(`
  query itemContributorsQuery($slug: Slug!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      ...ContributionsBlockFragment
    }
  }
`);

export const itemFilesQuery = graphql(`
  query itemFilesQuery($slug: Slug!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      assets {
        ...AssetsBlockFragment
      }
    }
  }
`);

export const itemFileDetailQuery = graphql(`
  query itemFileDetailQuery($slug: Slug!, $file: Slug!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
    }
    asset(slug: $file) {
      ...AssetDetailBlockFragment
    }
  }
`);

export const itemMetadataQuery = graphql(`
  query itemMetadataQuery($slug: Slug!) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      layouts {
        metadata {
          template {
            ...MetadataTemplateFragment
          }
        }
        main {
          ...MainLayoutFragment
        }
      }
    }
  }
`);

export const itemMetricsQuery = graphql(`
  query itemMetricsQuery(
    $slug: Slug!
    $dateRange: DateFilterInput!
    $precision: AnalyticsPrecision!
    $usOnly: Boolean!
  ) {
    item(slug: $slug) {
      ...ItemShellFragment
      ...ItemMetaFragment
      ...getStaticGoogleScholarDataFragment
      community {
        ...CommunityContextFragment
      }
      ...ArticleAnalyticsBlockFragment
    }
  }
`);
