/**
 * @generated SignedSource<<7d30c2aeed0a6acac9b59077b8188666>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type ViewCounterQuery$variables = {
  slug: string;
};
export type ViewCounterQuery$data = {
  readonly collection: {
    readonly __typename: "Collection";
    readonly assetDownloads: {
      readonly total: number;
    };
    readonly entityViews: {
      readonly total: number;
    };
  } | null | undefined;
  readonly community: {
    readonly __typename: "Community";
  } | null | undefined;
  readonly item: {
    readonly __typename: "Item";
    readonly assetDownloads: {
      readonly total: number;
    };
    readonly entityViews: {
      readonly total: number;
    };
  } | null | undefined;
};
export type ViewCounterQuery = {
  response: ViewCounterQuery$data;
  variables: ViewCounterQuery$variables;
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
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "total",
    "storageKey": null
  }
],
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "AnalyticsEventCountSummary",
  "kind": "LinkedField",
  "name": "entityViews",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "AnalyticsEventCountSummary",
  "kind": "LinkedField",
  "name": "assetDownloads",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v6 = [
  (v2/*: any*/),
  (v4/*: any*/),
  (v5/*: any*/)
],
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v8 = [
  (v2/*: any*/),
  (v4/*: any*/),
  (v5/*: any*/),
  (v7/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ViewCounterQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v6/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Community",
        "kind": "LinkedField",
        "name": "community",
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
    "name": "ViewCounterQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Item",
        "kind": "LinkedField",
        "name": "item",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Collection",
        "kind": "LinkedField",
        "name": "collection",
        "plural": false,
        "selections": (v8/*: any*/),
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "Community",
        "kind": "LinkedField",
        "name": "community",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v7/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c3174bcccb33b6c1121ff79dae3ee444",
    "id": null,
    "metadata": {},
    "name": "ViewCounterQuery",
    "operationKind": "query",
    "text": "query ViewCounterQuery(\n  $slug: Slug!\n) {\n  item(slug: $slug) {\n    __typename\n    entityViews {\n      total\n    }\n    assetDownloads {\n      total\n    }\n    id\n  }\n  collection(slug: $slug) {\n    __typename\n    entityViews {\n      total\n    }\n    assetDownloads {\n      total\n    }\n    id\n  }\n  community(slug: $slug) {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "56e69258d5565b3ef528b4bde75652a4";

export default node;
