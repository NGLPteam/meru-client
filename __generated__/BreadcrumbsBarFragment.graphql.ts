/**
 * @generated SignedSource<<cdd4b77a76bcdf2c6640e6122cb33b31>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type BreadcrumbsBarFragment$data = {
  readonly __typename: string;
  readonly permalinks?: ReadonlyArray<{
    readonly canonical: boolean;
    readonly uri: string;
  }>;
  readonly slug?: string;
  readonly title: string;
  readonly " $fragmentSpreads": FragmentRefs<"BreadcrumbsFragment">;
  readonly " $fragmentType": "BreadcrumbsBarFragment";
};
export type BreadcrumbsBarFragment$key = {
  readonly " $data"?: BreadcrumbsBarFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"BreadcrumbsBarFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "BreadcrumbsBarFragment",
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
    },
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Permalink",
          "kind": "LinkedField",
          "name": "permalinks",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "canonical",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "uri",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "type": "Permalinkable",
      "abstractKey": "__isPermalinkable"
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BreadcrumbsFragment"
    }
  ],
  "type": "Entity",
  "abstractKey": "__isEntity"
};

(node as any).hash = "05b53144935cc6682d75e81916a59039";

export default node;
