import { graphql } from "@/lib/api/gql";

export const pagesTemplateFragment = graphql(`
  fragment PagesTemplateFragment on PageListTemplateInstance {
    __typename
    hidden
    pagesDefinition: definition {
      background
      width
    }
    entity {
      ...ListPagesTemplateFragment
    }
  }
`);

export const listPagesTemplateFragment = graphql(`
  fragment ListPagesTemplateFragment on Entity {
    ... on Sluggable {
      slug
    }
    ... on Item {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
    ... on Collection {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
    ... on Community {
      pages {
        edges {
          node {
            slug
            title
          }
        }
      }
    }
  }
`);
