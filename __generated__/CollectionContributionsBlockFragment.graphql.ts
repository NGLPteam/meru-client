/**
 * @generated SignedSource<<1e7c1618150c6c2c08b82b6457bfa9df>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type AttachmentStorage = "CACHE" | "DERIVATIVES" | "REMOTE" | "STORE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type CollectionContributionsBlockFragment$data = {
  readonly attributions: ReadonlyArray<{
    readonly contributor: {
      readonly image: {
        readonly storage: AttachmentStorage | null | undefined;
      };
    };
    readonly roles: ReadonlyArray<{
      readonly label: string;
    }>;
    readonly slug: string;
    readonly " $fragmentSpreads": FragmentRefs<"ContributorFragment">;
  }>;
  readonly " $fragmentSpreads": FragmentRefs<"BackButtonFragment">;
  readonly " $fragmentType": "CollectionContributionsBlockFragment";
};
export type CollectionContributionsBlockFragment$key = {
  readonly " $data"?: CollectionContributionsBlockFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"CollectionContributionsBlockFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CollectionContributionsBlockFragment",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "BackButtonFragment"
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "CollectionAttribution",
      "kind": "LinkedField",
      "name": "attributions",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "slug",
          "storageKey": null
        },
        {
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
              "name": "label",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "contributor",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "ImageAttachment",
              "kind": "LinkedField",
              "name": "image",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "storage",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "ContributorFragment"
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Collection",
  "abstractKey": null
};

(node as any).hash = "9cc41844baf5e1926733675dd58bcbff";

export default node;
