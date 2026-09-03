import { graphql } from "@/lib/api/gql";

export const imageHeroTemplateFragment = graphql(`
  fragment ImageHeroTemplateFragment on ImageAttachment {
    hero {
      webp {
        url
        alt
        width
        height
      }
    }
    large {
      webp {
        url
        width
      }
    }
    medium {
      webp {
        url
        width
      }
    }
  }
`);
