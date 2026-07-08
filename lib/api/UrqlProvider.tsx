"use client";

import { useState } from "react";
import { Provider } from "urql";
import makeUrqlClient from "./makeUrqlClient";
import { getAPIURL } from "./client";
import { getClientToken } from "./clientToken";

// Client-side urql Provider for the interactive queries (search, entity
// ordering, contributor pagination, analytics). Server components fetch via
// queryApi and never need this. The client is built once; its fetchOptions
// closure reads the current access token from the module-scoped holder
// (populated by ViewerContext), so the token can arrive after the client is
// created without a rebuild.
export default function UrqlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() =>
    makeUrqlClient(getAPIURL(), "network-only", () => {
      const token = getClientToken();
      return token ? { headers: { authorization: `Bearer ${token}` } } : {};
    }),
  );

  return <Provider value={client}>{children}</Provider>;
}
