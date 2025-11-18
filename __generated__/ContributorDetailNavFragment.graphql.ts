/**
 * @generated SignedSource<<4973851183b4a30cd632ff83ea413470>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ContributorDetailNavFragment$data = {
  readonly __typename: string;
  readonly slug?: string;
  readonly title: string;
  readonly " $fragmentType": "ContributorDetailNavFragment";
};
export type ContributorDetailNavFragment$key = {
  readonly " $data"?: ContributorDetailNavFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"ContributorDetailNavFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ContributorDetailNavFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slug",
          "storageKey": null
        }
      ],
      "type": "Sluggable",
      "abstractKey": "__isSluggable"
    }
  ],
  "type": "Entity",
  "abstractKey": "__isEntity"
};

(node as any).hash = "44f8398f53026a06b540cefda44eb7f4";

export default node;
