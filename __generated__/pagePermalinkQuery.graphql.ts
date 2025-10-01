/**
 * @generated SignedSource<<6b56a8a487c473b7b8c4b2286083ae38>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type PermalinkableKind = "COLLECTION" | "COMMUNITY" | "ITEM" | "%future added value";
export type pagePermalinkQuery$variables = {
  uri: string;
};
export type pagePermalinkQuery$data = {
  readonly permalinkByUri: {
    readonly kind: PermalinkableKind;
    readonly permalinkableSlug: string;
  } | null | undefined;
};
export type pagePermalinkQuery = {
  response: pagePermalinkQuery$data;
  variables: pagePermalinkQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "uri"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "uri",
    "variableName": "uri"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "kind",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "permalinkableSlug",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "pagePermalinkQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Permalink",
        "kind": "LinkedField",
        "name": "permalinkByUri",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
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
    "name": "pagePermalinkQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Permalink",
        "kind": "LinkedField",
        "name": "permalinkByUri",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
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
    "cacheID": "fd305871f3ae16e02e280775efc540c6",
    "id": null,
    "metadata": {},
    "name": "pagePermalinkQuery",
    "operationKind": "query",
    "text": "query pagePermalinkQuery(\n  $uri: String!\n) {\n  permalinkByUri(uri: $uri) {\n    kind\n    permalinkableSlug\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "a473eaa55550aa905936f98d4defae96";

export default node;
