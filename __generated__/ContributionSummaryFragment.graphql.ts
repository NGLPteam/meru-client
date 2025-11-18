/**
 * @generated SignedSource<<7b6be4b6b1d641e116b2f59e5c40d433>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContributionSummaryFragment$data = {
  readonly entity?: {
    readonly " $fragmentSpreads": FragmentRefs<"ContributionSummaryEntityFragment">;
  };
  readonly roles?: ReadonlyArray<{
    readonly identifier: string;
    readonly label: string;
  }>;
  readonly " $fragmentType": "ContributionSummaryFragment";
};
export type ContributionSummaryFragment$key = {
  readonly " $data"?: ContributionSummaryFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ContributionSummaryFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "ControlledVocabularyItem",
  "kind": "LinkedField",
  "name": "roles",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "identifier",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "label",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v1 = [
  {
    "args": null,
    "kind": "FragmentSpread",
    "name": "ContributionSummaryEntityFragment"
  }
];
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ContributionSummaryFragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "entity",
          "args": null,
          "concreteType": "Item",
          "kind": "LinkedField",
          "name": "item",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        }
      ],
      "type": "ContributorItemAttribution",
      "abstractKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        (v0/*: any*/),
        {
          "alias": "entity",
          "args": null,
          "concreteType": "Collection",
          "kind": "LinkedField",
          "name": "collection",
          "plural": false,
          "selections": (v1/*: any*/),
          "storageKey": null
        }
      ],
      "type": "ContributorCollectionAttribution",
      "abstractKey": null
    }
  ],
  "type": "ContributorAttribution",
  "abstractKey": "__isContributorAttribution"
};
})();

(node as any).hash = "62c5e23ede39d8f2f2261dc7f92362aa";

export default node;
