"use client";

import React, { createContext } from "react";
// Type-only imports: these modules pull in the server urql client (queryApi ->
// client.ts, which reads PUBLIC_API_URL). This context is used by client
// islands, so import the query/fragment documents for their *types* only — a
// value import would bundle the server client into the browser.
import type { query as getStaticGlobalContextDataQuery } from "@/contexts/GlobalStaticContext/getStaticGlobalContextData.query";
import type { fragment as getStaticEntityDataFragment } from "@/contexts/GlobalStaticContext/getStaticEntityData";
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
