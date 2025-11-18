/**
 * @generated SignedSource<<d30b97de717e1412519f0a00b91535ac>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getEntityDisplayNumberFragment$data = {
  readonly issueNumber?: {
    readonly content?: string | null | undefined;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"getEntityVolumeNumberFragment">;
  readonly " $fragmentType": "getEntityDisplayNumberFragment";
};
export type getEntityDisplayNumberFragment$key = {
  readonly " $data"?: getEntityDisplayNumberFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getEntityDisplayNumberFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getEntityDisplayNumberFragment"
};

(node as any).hash = "2c79a4ff7de441bcdfb8c5b86c34ef67";

export default node;
