/**
 * @generated SignedSource<<9cfa1efa326b1c735942f8276a9b4ec2>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type getEntityVolumeNumberFragment$data = {
  readonly vol?: {
    readonly number?: {
      readonly content?: string | null | undefined;
    } | null | undefined;
  } | null | undefined;
  readonly volumeNumber?: {
    readonly content?: string | null | undefined;
  } | null | undefined;
  readonly " $fragmentType": "getEntityVolumeNumberFragment";
};
export type getEntityVolumeNumberFragment$key = {
  readonly " $data"?: getEntityVolumeNumberFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getEntityVolumeNumberFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getEntityVolumeNumberFragment"
};

(node as any).hash = "d7c749f44d822e6c08c6e61c25dcda24";

export default node;
