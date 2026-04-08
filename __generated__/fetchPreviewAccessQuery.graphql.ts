/**
 * @generated SignedSource<<4f02eb4ee0a7d4d4daa79934be7d0bec>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type fetchPreviewAccessQuery$variables = {
  slug: string;
};
export type fetchPreviewAccessQuery$data = {
  readonly item: {
    readonly canUpdate: {
      readonly value: boolean;
    };
  } | null | undefined;
};
export type fetchPreviewAccessQuery = {
  response: fetchPreviewAccessQuery$data;
  variables: fetchPreviewAccessQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "slug"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "concreteType": "AuthorizationResult",
  "kind": "LinkedField",
  "name": "canUpdate",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "value",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "fetchPreviewAccessQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "fetchPreviewAccessQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "08f920d26ccf75a630b6f968d60d8e69",
    "id": null,
    "metadata": {},
    "name": "fetchPreviewAccessQuery",
    "operationKind": "query",
    "text": "query fetchPreviewAccessQuery(\n  $slug: Slug!\n) {\n  item(slug: $slug) {\n    canUpdate {\n      value\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b7e2d6830cccfb94f20b6e60545af9f2";

export default node;
