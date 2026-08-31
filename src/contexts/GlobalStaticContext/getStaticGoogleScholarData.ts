import { graphql } from "@/lib/api/gql";

// Fragment only — no fetch function. The item query selects it and the Google
// Scholar <meta> tags render server-side.
export const fragment = graphql(`
  fragment getStaticGoogleScholarDataFragment on Entity {
    __typename
    ... on Item {
      title

      schemaDefinition {
        identifier
      }

      published {
        precision
        value
      }

      pdf: schemaProperty(fullPath: "pdf_version") {
        ... on AssetProperty {
          asset {
            ... on AssetPDF {
              downloadUrl
            }
          }
        }
      }

      community {
        title
      }

      contributions {
        nodes {
          role
          contributor {
            ... on PersonContributor {
              __typename
              familyName
              givenName
            }
            ... on OrganizationContributor {
              __typename
              legalName
            }
          }
        }
      }

      issueNumber: schemaProperty(fullPath: "issue.number") {
        ... on StringProperty {
          value: content
        }
      }

      volumeNumber: schemaProperty(fullPath: "volume.id") {
        ... on StringProperty {
          value: content
        }
      }

      startPage: schemaProperty(fullPath: "issue.fpage") {
        ... on IntegerProperty {
          value: integerValue
        }
      }

      endPage: schemaProperty(fullPath: "issue.lpage") {
        ... on IntegerProperty {
          value: integerValue
        }
      }

      institution: schemaProperty(fullPath: "degree.grantor") {
        ... on StringProperty {
          value: content
        }
      }

      journal: ancestorOfType(schema: "nglp:journal") {
        ... on Collection {
          title
        }
      }

      volume: ancestorOfType(schema: "nglp:journal_volume") {
        ... on Collection {
          number: schemaProperty(fullPath: "number") {
            ... on StringProperty {
              value: content
            }
          }
        }
      }

      issue: ancestorOfType(schema: "nglp:journal_issue") {
        ... on Collection {
          number: schemaProperty(fullPath: "number") {
            ... on StringProperty {
              value: content
            }
          }
        }
      }
    }
  }
`);
