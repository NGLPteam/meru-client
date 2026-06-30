/**
 * @generated SignedSource<<a8dfa749a428e1ea9eaf103a92eeed19>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type SearchSchemaFilterFragment$data = {
  readonly schemas: ReadonlyArray<{
    readonly name: string;
    readonly namespace: string;
    readonly schemaDefinition: {
      readonly slug: string;
    };
  }>;
  readonly " $fragmentType": "SearchSchemaFilterFragment";
};
export type SearchSchemaFilterFragment$key = {
  readonly " $data"?: SearchSchemaFilterFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"SearchSchemaFilterFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "SearchSchemaFilterFragment",
  "selections": [
    {
      "alias": "schemas",
      "args": null,
      "concreteType": "SchemaVersion",
      "kind": "LinkedField",
      "name": "availableSchemaVersions",
      "plural": true,
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
          "name": "namespace",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "SchemaDefinition",
          "kind": "LinkedField",
          "name": "schemaDefinition",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "slug",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SearchScope",
  "abstractKey": null
};

(node as any).hash = "9be650acd0656597132aee451a08d4b2";

export default node;
