"use client";

import { createContext, type PropsWithChildren, useState } from "react";
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

type Setter = (data: FragmentType<typeof fragment> | null) => void;
export const SetCommunityContext = createContext<Setter | undefined | null>(
  null,
);

export const SetCommunityContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [data, setData] = useState<
    FragmentType<typeof fragment> | undefined | null
  >();
  const community = useFragment(fragment, data);

  return (
    <SetCommunityContext.Provider value={setData}>
      <CommunityContext.Provider value={community}>
        {children}
      </CommunityContext.Provider>
    </SetCommunityContext.Provider>
  );
};
