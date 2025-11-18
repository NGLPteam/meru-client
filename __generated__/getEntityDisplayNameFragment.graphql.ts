/**
 * @generated SignedSource<<efb7ce49698c9274e1ba4725f53c0b9a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getEntityDisplayNameFragment$data = {
  readonly issueNumber?: {
    readonly content?: string | null | undefined;
  } | null | undefined;
  readonly title?: string;
  readonly vol?: {
    readonly title?: string;
  } | null | undefined;
  readonly " $fragmentSpreads": FragmentRefs<"getEntityVolumeNumberFragment">;
  readonly " $fragmentType": "getEntityDisplayNameFragment";
};
export type getEntityDisplayNameFragment$key = {
  readonly " $data"?: getEntityDisplayNameFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getEntityDisplayNameFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getEntityDisplayNameFragment"
};

(node as any).hash = "836e70c5c71f764a1eac3cfba0579644";

export default node;
