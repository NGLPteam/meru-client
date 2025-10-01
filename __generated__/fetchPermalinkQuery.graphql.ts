/**
 * @generated SignedSource<<171f6043b20088a338ea98d0dc74adce>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type PermalinkableKind = "COLLECTION" | "COMMUNITY" | "ITEM" | "%future added value";
export type fetchPermalinkQuery$variables = {
  uri: string;
};
export type fetchPermalinkQuery$data = {
  readonly permalinkByUri: {
    readonly kind: PermalinkableKind;
    readonly permalinkableSlug: string;
  } | null | undefined;
};
export type fetchPermalinkQuery = {
  response: fetchPermalinkQuery$data;
  variables: fetchPermalinkQuery$variables;
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
    "name": "fetchPermalinkQuery",
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
    "name": "fetchPermalinkQuery",
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
    "cacheID": "f4b1d4112e40814fe3d8fe046bebdbee",
    "id": null,
    "metadata": {},
    "name": "fetchPermalinkQuery",
    "operationKind": "query",
    "text": "query fetchPermalinkQuery(\n  $uri: String!\n) {\n  permalinkByUri(uri: $uri) {\n    kind\n    permalinkableSlug\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "db5002c4df0472c6ab0470a44f1e951c";

export default node;
