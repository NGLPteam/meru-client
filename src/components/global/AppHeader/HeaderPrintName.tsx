"use client";

// Print-only community name (the header's `@media print` block). No viewer, no
// interactivity — rendered statically (no client directive).
import CommunityName from "@/components/composed/community/CommunityName";
import {
  ActiveCommunityFragment,
  type ActiveCommunityRef,
} from "@/components/global/graphql";
import { useFragment } from "@/lib/api/gql";

type Props = {
  community?: ActiveCommunityRef;
};

export default function HeaderPrintName({ community }: Props) {
  const activeCommunity = useFragment(ActiveCommunityFragment, community);
  return <CommunityName data={activeCommunity} />;
}
