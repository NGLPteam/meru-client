"use client";

import React, { createContext } from "react";
import { query as getStaticGlobalContextDataQuery } from "@/contexts/GlobalStaticContext/getStaticGlobalContextData";
import { fragment as getStaticEntityDataFragment } from "@/contexts/GlobalStaticContext/getStaticEntityData";
import { type DocumentType } from "@/lib/api/gql";

export type GlobalStaticData = DocumentType<
  typeof getStaticGlobalContextDataQuery
>;

type GlobalEntityData = {
  entityData?: DocumentType<typeof getStaticEntityDataFragment>;
};

type GlobalStaticValue = Partial<GlobalStaticData> & GlobalEntityData;

const GlobalStaticContext = createContext<GlobalStaticValue>({});

function GlobalStaticContextProvider({ children, globalData }: Props) {
  return (
    <GlobalStaticContext.Provider value={globalData || {}}>
      {children}
    </GlobalStaticContext.Provider>
  );
}

interface Props {
  children: React.ReactNode;
  globalData?: GlobalStaticData;
}

export default GlobalStaticContext;

export { GlobalStaticContextProvider };
