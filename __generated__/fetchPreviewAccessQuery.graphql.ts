/**
 * @generated SignedSource<<66a331dde9ad08cd47d94453998cb52a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type fetchPreviewAccessQuery$variables = {
  isCollection: boolean;
  isCommunity: boolean;
  isItem: boolean;
  slug: string;
};
export type fetchPreviewAccessQuery$data = {
  readonly collection?: {
    readonly canUpdate: {
      readonly value: boolean;
    };
  } | null | undefined;
  readonly community?: {
    readonly canUpdate: {
      readonly value: boolean;
    };
  } | null | undefined;
  readonly item?: {
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
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isCollection"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isCommunity"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isItem"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "slug"
},
v4 = [
  {
    "kind": "Variable",
    "name": "slug",
    "variableName": "slug"
  }
],
v5 = {
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
},
v6 = [
  (v5/*: any*/)
],
v7 = [
  (v5/*: any*/),
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "fetchPreviewAccessQuery",
    "selections": [
      {
        "condition": "isItem",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Item",
            "kind": "LinkedField",
            "name": "item",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCollection",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Collection",
            "kind": "LinkedField",
            "name": "collection",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCommunity",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Community",
            "kind": "LinkedField",
            "name": "community",
            "plural": false,
            "selections": (v6/*: any*/),
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v3/*: any*/),
      (v2/*: any*/),
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "fetchPreviewAccessQuery",
    "selections": [
      {
        "condition": "isItem",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Item",
            "kind": "LinkedField",
            "name": "item",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCollection",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Collection",
            "kind": "LinkedField",
            "name": "collection",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      },
      {
        "condition": "isCommunity",
        "kind": "Condition",
        "passingValue": true,
        "selections": [
          {
            "alias": null,
            "args": (v4/*: any*/),
            "concreteType": "Community",
            "kind": "LinkedField",
            "name": "community",
            "plural": false,
            "selections": (v7/*: any*/),
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "b4002a70a8d84b7c40a6a68245776f85",
    "id": null,
    "metadata": {},
    "name": "fetchPreviewAccessQuery",
    "operationKind": "query",
    "text": "query fetchPreviewAccessQuery(\n  $slug: Slug!\n  $isItem: Boolean!\n  $isCollection: Boolean!\n  $isCommunity: Boolean!\n) {\n  item(slug: $slug) @include(if: $isItem) {\n    canUpdate {\n      value\n    }\n    id\n  }\n  collection(slug: $slug) @include(if: $isCollection) {\n    canUpdate {\n      value\n    }\n    id\n  }\n  community(slug: $slug) @include(if: $isCommunity) {\n    canUpdate {\n      value\n    }\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "b4db8666cf5fc9c5744148f23d8f184c";

export default node;
