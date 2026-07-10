import { graphql } from "@/lib/api/gql";

// Phase 0: the query that spreads SiteNameProof's fragment. Defined in a .ts
// file (not .astro) so graphql-codegen picks it up. The .astro page runs it and
// threads the fragment ref down to the component.
export const FragProofQuery = graphql(`
  query Phase0FragProofQuery {
    globalConfiguration {
      ...SiteNameProof
    }
  }
`);
