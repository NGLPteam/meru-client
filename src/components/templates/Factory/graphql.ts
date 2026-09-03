import { graphql } from "@/lib/api/gql";

export const factoryTemplatesFragment = graphql(`
  fragment FactoryTemplatesFragment on AnyMainTemplateInstance {
    ... on TemplateInstance {
      templateKind
    }
    ... on ContributorListTemplateInstance {
      ...ContributorsTemplateFragment
    }
    ... on DetailTemplateInstance {
      ...DetailTemplateFragment
    }
    ... on OrderingTemplateInstance {
      ...OrderingNavigationTemplateFragment
    }
    ... on PageListTemplateInstance {
      ...PagesTemplateFragment
    }
    ... on DescendantListTemplateInstance {
      slots {
        blockHeader {
          content
        }
      }
      entityList {
        empty
      }
    }
    ... on LinkListTemplateInstance {
      entityList {
        empty
      }
    }
    ... on BlurbTemplateInstance {
      ...BlurbTemplateFragment
    }
    ...DescendantsTemplateFragment
    ...LinksTemplateFragment
  }
`);
