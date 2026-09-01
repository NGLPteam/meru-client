import { graphql } from "@/lib/api/gql";

// Shared collection shell selection (hero + view counter target + entity nav +
// processing check), reused by the landing and every sub-route. `community`
// (the parent community for the header context) and metadata are spread directly
// on each query so the .astro can read collection.community / metadata unmasked.
export const collectionShellFragment = graphql(`
  fragment CollectionShellFragment on Collection {
    canPreview {
      value
    }
    layouts {
      hero {
        ...HeroTemplateFragment
      }
      ...ProcessingCheckFragment
    }
    ...SearchButtonFragment
    ...EntityNavBarFragment
  }
`);

export const collectionMetaFragment = graphql(`
  fragment CollectionMetaFragment on Collection {
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

// Selects the first template's kind for the computed background start.
export const collectionQuery = graphql(`
  query collectionQuery($slug: Slug!) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      layouts {
        main {
          ...MainLayoutFragment
          templates {
            ... on TemplateInstance {
              templateKind
            }
          }
        }
      }
    }
  }
`);

export const collectionPageQuery = graphql(`
  query collectionPageQuery($slug: Slug!, $pageSlug: String!) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      page(slug: $pageSlug) {
        ...EntityPageLayoutFragment
      }
    }
  }
`);

export const collectionBrowseQuery = graphql(`
  query collectionBrowseQuery($slug: Slug!, $identifier: String!, $page: Int) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      ordering(identifier: $identifier) {
        disabled
        ...EntityOrderingLayoutFragment
      }
    }
  }
`);

export const collectionSearchQuery = graphql(`
  query collectionSearchQuery(
    $slug: Slug!
    $query: String
    $predicates: [SearchPredicateInput!]
    $page: Int
    $order: EntityOrder
    $schema: [String!]
  ) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      ...SearchLayoutEntityFragment
    }
  }
`);

export const collectionAnnouncementQuery = graphql(`
  query collectionAnnouncementQuery($slug: Slug!, $announcementSlug: Slug!) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      announcement(slug: $announcementSlug) {
        ...EntityAnnouncementLayoutFragment
      }
    }
  }
`);

export const collectionContributorsQuery = graphql(`
  query collectionContributorsQuery($slug: Slug!) {
    collection(slug: $slug) {
      ...CollectionShellFragment
      ...CollectionMetaFragment
      community {
        ...CommunityContextFragment
      }
      ...CollectionContributionsBlockFragment
    }
  }
`);
