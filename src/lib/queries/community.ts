import { graphql } from "@/lib/api/gql";

// Community landing page — combines the Next community layout query
// (layoutCommunityTemplateQuery) and page query (pageTemplateQuery) into one,
// plus the metadata fields (communityMetadataQuery), so a single fetch drives
// the chrome community context, the community hero/nav/main content, and the
// page <head>. `...CommunityContextFragment` replaces the deleted SetCommunity.
export const communityQuery = graphql(`
  query communityQuery($slug: Slug!) {
    community(slug: $slug) {
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
        main {
          ...MainLayoutFragment
        }
        ...ProcessingCheckFragment
      }
      ...CommunityNavBarFragment
      ...CommunityNavBarEntityFragment
      ...CommunityContextFragment
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
