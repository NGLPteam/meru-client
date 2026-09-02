import { graphql } from "@/lib/api/gql";

/* eslint-disable @typescript-eslint/no-unused-vars -- fragment definitions are
   referenced by GraphQL name from SearchFilterFragment; codegen scans them. */

const searchFilterInputFragment = graphql(`
  fragment SearchFilterInputFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators
  }
`);

export const searchFilterSelectFragment = graphql(`
  fragment SearchFilterSelectFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators

    ... on SelectProperty {
      options {
        label
        value
      }
    }
  }
`);

const searchFilterDateFragment = graphql(`
  fragment SearchFilterDateFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators
  }
`);

const searchFilterNumberFragment = graphql(`
  fragment SearchFilterNumberFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators
  }
`);

const searchFilterBooleanFragment = graphql(`
  fragment SearchFilterBooleanFragment on SearchableProperty {
    label
    description
    searchPath
    searchOperators
  }
`);

export const searchFilterFragment = graphql(`
  fragment SearchFilterFragment on SearchableProperty {
    ... on ScalarProperty {
      type
    }

    ...SearchFilterInputFragment
    ...SearchFilterSelectFragment
    ...SearchFilterDateFragment
    ...SearchFilterNumberFragment
    ...SearchFilterBooleanFragment
  }
`);
