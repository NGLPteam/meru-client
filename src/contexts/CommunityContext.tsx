"use client";

import { createContext, type PropsWithChildren } from "react";
import {
  graphql,
  useFragment,
  type FragmentType,
  type DocumentType,
} from "@/lib/api/gql";

export const CommunityContext = createContext<
  DocumentType<typeof fragment> | undefined | null
>(null);

export const CommunityContextProvider = ({
  children,
  data,
}: PropsWithChildren & { data?: FragmentType<typeof fragment> | null }) => {
  const community = useFragment(fragment, data);
  return (
    <CommunityContext.Provider value={community}>
      {children}
    </CommunityContext.Provider>
  );
};

const fragment = graphql(`
  fragment CommunityContextFragment on Community {
    ...CommunityNameFragment
    ...CommunityNavListFragment
    ...CommunityPickerCommunityNameFragment
  }
`);
