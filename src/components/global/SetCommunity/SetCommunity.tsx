"use client";

import { PropsWithChildren, useContext, useEffect } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { SetCommunityContext } from "@/contexts/CommunityContext";

type Props = PropsWithChildren & {
  data?: FragmentType<typeof fragment> | null;
};

export default function SetCommunity({ data, children }: Props) {
  const community = useFragment(fragment, data);
  const setCommunity = useContext(SetCommunityContext);

  useEffect(() => {
    if (setCommunity) setCommunity(community ?? null);
  }, [community, setCommunity]);

  return children;
}

const fragment = graphql(`
  fragment SetCommunityFragment on Community {
    ...CommunityContextFragment
  }
`);
