/**
 * @generated SignedSource<<e1b09789b35dd63fdccca38f883255fc>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getThumbWithFallbackFragment$data = {
  readonly breadcrumbs?: ReadonlyArray<{
    readonly crumb: {
      readonly thumbnail?: {
        readonly image: {
          readonly webp: {
            readonly url: string | null | undefined;
          };
        };
        readonly " $fragmentSpreads": FragmentRefs<"CoverCardListFragment" | "CoverImageFragment">;
      };
    };
  }>;
  readonly thumbnail?: {
    readonly image: {
      readonly webp: {
        readonly url: string | null | undefined;
      };
    };
    readonly " $fragmentSpreads": FragmentRefs<"CoverCardListFragment" | "CoverImageFragment">;
  };
  readonly " $fragmentType": "getThumbWithFallbackFragment";
};
export type getThumbWithFallbackFragment$key = {
  readonly " $data"?: getThumbWithFallbackFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getThumbWithFallbackFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getThumbWithFallbackFragment"
};

(node as any).hash = "5e55d0a680a3f8595c16699aa5879cc3";

export default node;
