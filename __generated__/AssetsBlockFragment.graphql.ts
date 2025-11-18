/**
 * @generated SignedSource<<09086fbfa35b07ba2ca76f2937f12840>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type AssetsBlockFragment$data = {
  readonly edges: ReadonlyArray<{
    readonly node: {
      readonly " $fragmentSpreads": FragmentRefs<"AssetBlockItemFragment">;
    };
  }>;
  readonly " $fragmentType": "AssetsBlockFragment";
};
export type AssetsBlockFragment$key = {
  readonly " $data"?: AssetsBlockFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"AssetsBlockFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AssetsBlockFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "AssetEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "AssetBlockItemFragment"
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "AssetConnection",
  "abstractKey": null
};

(node as any).hash = "0ee6f0bdd6e125c57009324ff7112456";

export default node;
