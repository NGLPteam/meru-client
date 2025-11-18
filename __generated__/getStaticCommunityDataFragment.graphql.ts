/**
 * @generated SignedSource<<dc5a8afa63104a10eabe42a3407a6e2a>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
export type AttachmentStorage = "CACHE" | "DERIVATIVES" | "REMOTE" | "STORE" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type getStaticCommunityDataFragment$data = {
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
  readonly " $fragmentType": "getStaticCommunityDataFragment";
};
export type getStaticCommunityDataFragment$key = {
  readonly " $data"?: getStaticCommunityDataFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"getStaticCommunityDataFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "getStaticCommunityDataFragment"
};

(node as any).hash = "f117995b5ecdb8e395616bf87cc872fa";

export default node;
