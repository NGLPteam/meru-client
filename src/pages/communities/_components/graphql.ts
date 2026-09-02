import { graphql } from "@/lib/api/gql";

// Shared community shell selection (hero + nav bar + processing check) reused by
// the landing and every sub-route, so they all render the same community shell.
// The active-community bundle + metadata are spread directly on each query (not nested
// here) so the .astro can read them without unmasking.
export const communityShellFragment = graphql(`
  fragment CommunityShellFragment on Community {
    canPreview {
      value
    }
    layouts {
      hero {
        template {
          definition {
            enableDescendantBrowsing
          }
        }
        ...HeroTemplateFragment
      }
      ...ProcessingCheckFragment
    }
    ...CommunityNavBarFragment
    ...CommunityNavBarEntityFragment
  }
`);

// Metadata fields, unmasked in buildCommunityMeta (server-side, via readFragment).
export const communityMetaFragment = graphql(`
  fragment CommunityMetaFragment on Community {
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

export const communityQuery = graphql(`
  query communityQuery($slug: Slug!) {
    community(slug: $slug) {
      ...CommunityShellFragment
      ...CommunityMetaFragment
      layouts {
        main {
          ...MainLayoutFragment
        }
      }
    }
    # Aliased re-selection so nav/header islands get an object carrying ONLY
    # this data — passing the community above would serialize its entire
    # layouts (all template slot content) into island props.
    communityRef: community(slug: $slug) {
      ...ActiveCommunityFragment
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
    }
  }
`);

export const communityPageQuery = graphql(`
  query communityPageQuery($slug: Slug!, $pageSlug: String!) {
    community(slug: $slug) {
      ...CommunityShellFragment
      ...CommunityMetaFragment
      page(slug: $pageSlug) {
        ...CommunityPageLayoutFragment
      }
    }
    communityRef: community(slug: $slug) {
      ...ActiveCommunityFragment
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
    }
  }
`);

export const communityBrowseQuery = graphql(`
  query communityBrowseQuery($slug: Slug!) {
    community(slug: $slug) {
      ...CommunityShellFragment
      ...CommunityMetaFragment
    }
    communityRef: community(slug: $slug) {
      ...ActiveCommunityFragment
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
    }
  }
`);

export const communitySearchQuery = graphql(`
  query communitySearchQuery($slug: Slug!) {
    community(slug: $slug) {
      ...CommunityShellFragment
      ...CommunityMetaFragment
      ...SearchLayoutEntityFragment
    }
    communityRef: community(slug: $slug) {
      ...ActiveCommunityFragment
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
    }
  }
`);
