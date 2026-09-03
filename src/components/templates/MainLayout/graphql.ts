import { graphql } from "@/lib/api/gql";

export const mainLayoutFragment = graphql(`
  fragment MainLayoutFragment on MainLayoutInstance {
    allHidden
    entity {
      __typename
    }
    templates {
      ... on TemplateInstance {
        hidden
        templateKind
        prevSiblings {
          dark
          hidden
          position
          templateKind
        }
        nextSiblings {
          dark
          hidden
          position
          templateKind
        }
      }
      ...FactoryTemplatesFragment
    }
  }
`);
