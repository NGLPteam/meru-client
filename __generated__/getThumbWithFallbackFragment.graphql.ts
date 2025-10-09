/**
 * @generated SignedSource<<47af34c5513f4eaaf5ec37048241f450>>
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

(node as any).hash = "e81cb688699a58c46cdf6dce2e74a132";

export default node;
