/**
 * @generated SignedSource<<acf3b7a3d7952735c7debd41c85a3ef4>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type AttachmentStorage = "CACHE" | "DERIVATIVES" | "REMOTE" | "STORE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type getStaticEntityDataFragment$data = {
  readonly heroImage: {
    readonly medium: {
      readonly webp: {
        readonly height: number | null | undefined;
        readonly url: string | null | undefined;
        readonly width: number | null | undefined;
      };
    };
    readonly storage: AttachmentStorage | null | undefined;
  };
  readonly heroImageMetadata: {
    readonly alt: string | null | undefined;
  } | null | undefined;
  readonly summary: string | null | undefined;
  readonly thumbnail: {
    readonly medium: {
      readonly webp: {
        readonly height: number | null | undefined;
        readonly url: string | null | undefined;
        readonly width: number | null | undefined;
      };
    };
    readonly storage: AttachmentStorage | null | undefined;
  };
  readonly thumbnailMetadata: {
    readonly alt: string | null | undefined;
  } | null | undefined;
  readonly title: string;
  readonly " $fragmentType": "getStaticEntityDataFragment";
};
export type getStaticEntityDataFragment$key = {
  readonly " $data"?: getStaticEntityDataFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getStaticEntityDataFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getStaticEntityDataFragment"
};

(node as any).hash = "334353a8ba536ff135337488bb61a25a";

export default node;
