/**
 * @generated SignedSource<<0ce63ddb6cbcd875025d085fff5e0d10>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getEntitySitemapFragment$data = {
  readonly __typename: "Collection";
  readonly collections: {
    readonly pageInfo: {
      readonly pageCount: number | null | undefined;
    };
  };
  readonly items: {
    readonly pageInfo: {
      readonly pageCount: number | null | undefined;
    };
  };
  readonly slug: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "getEntitySitemapFragment";
} | {
  readonly __typename: "Community";
  readonly collections: {
    readonly pageInfo: {
      readonly pageCount: number | null | undefined;
    };
  };
  readonly slug: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "getEntitySitemapFragment";
} | {
  readonly __typename: "Item";
  readonly items: {
    readonly pageInfo: {
      readonly pageCount: number | null | undefined;
    };
  };
  readonly slug: string;
  readonly updatedAt: string;
  readonly " $fragmentType": "getEntitySitemapFragment";
} | {
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  readonly __typename: "%other";
  readonly " $fragmentType": "getEntitySitemapFragment";
};
export type getEntitySitemapFragment$key = {
  readonly " $data"?: getEntitySitemapFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getEntitySitemapFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getEntitySitemapFragment"
};

(node as any).hash = "144975bf68e52e9d21b1501e050d665e";

export default node;
