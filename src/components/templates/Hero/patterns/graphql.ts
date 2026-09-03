import { graphql } from "@/lib/api/gql";

export const communityHeroHeaderFragment = graphql(`
  fragment CommunityHeroHeaderFragment on HeroLayoutInstance {
    entity {
      ... on Community {
        heroImage {
          ...ImageHeroTemplateFragment
          hero {
            webp {
              url
            }
          }
        }
        heroImageLayout
      }
    }
    template {
      definition {
        showHeroImage
        showBigSearchPrompt
      }
      slots {
        bigSearchPrompt {
          ...sharedInlineSlotFragment
        }
        header {
          empty
        }
        headerSummary {
          empty
        }
      }
      ...HeaderHeroFragment
    }
  }
`);

export const entityHeroHeaderFragment = graphql(`
  fragment EntityHeroHeaderFragment on HeroLayoutInstance {
    entity {
      ... on Collection {
        __typename
        visibility
        currentlyHidden
        heroImage {
          storage
          ...ImageHeroTemplateFragment
        }
        schemaDefinition {
          identifier
        }
      }
      ... on Item {
        __typename
        visibility
        currentlyHidden
        heroImage {
          storage
          ...ImageHeroTemplateFragment
        }
        schemaDefinition {
          identifier
        }
      }
      ...BreadcrumbsBarFragment
    }
    template {
      definition {
        background
        showHeroImage
        showBreadcrumbs
        showSharingLink
        showSplitDisplay
      }
      ...HeaderHeroFragment
      ...DetailHeroFragment
    }
  }
`);
