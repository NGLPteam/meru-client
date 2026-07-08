import { fragment as CoverImageFragment } from "@/components/atomic/images/CoverImage/CoverImage";
import { type FragmentType } from "@/lib/api/gql";
import type { Slot } from "../templates.types";

/*
  Question: Will the item thumbs be attachments or liquid templates?
*/

export type ListItem = {
  slots: {
    thumbnail: FragmentType<typeof CoverImageFragment> | null;
    contributors: Slot | null;
    header: Slot | null;
    subheader: Slot | null;
    metaOne: Slot | null;
    metaTwo: Slot | null;
    contextOne: Slot | null;
    contextTwo: Slot | null;
    contextThree: Slot | null;
    summary: Slot | null;
  };
};
