/**
 * @generated SignedSource<<ba606d622cd49bcf4cd38fbdbf5abddd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type SubmissionTargetState = "CLOSED" | "OPEN" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type BreadcrumbsBarFragment$data = {
  readonly __typename: string;
  readonly permalinks?: ReadonlyArray<{
    readonly canonical: boolean;
    readonly uri: string;
  }>;
  readonly schemaVersion: {
    readonly identifier: string;
    readonly name: string;
  };
  readonly slug?: string;
  readonly submissionTarget: {
    readonly state: SubmissionTargetState;
  } | null | undefined;
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
      "alias": null,
      "args": null,
      "concreteType": "SchemaVersion",
      "kind": "LinkedField",
      "name": "schemaVersion",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "identifier",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "SubmissionTarget",
      "kind": "LinkedField",
      "name": "submissionTarget",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "state",
          "storageKey": null
        }
      ],
      "storageKey": null
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

(node as any).hash = "d8f2dd5302d1c741b82c135908c2881a";

export default node;
