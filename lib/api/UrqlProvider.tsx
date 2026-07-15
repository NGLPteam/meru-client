"use client";

import { useState } from "react";
import { Provider } from "urql";
import makeUrqlClient from "./makeUrqlClient";
import { getAPIURL } from "./client";

// Client-side urql Provider for the only remaining browser queries — the two
// analytics widgets (ViewCounter, ArticleAnalyticsBlock). Both are ANONYMOUS:
// the access token never reaches the browser, so this client sends no auth
// header. It talks straight to NEXT_PUBLIC_API_URL (public counts only), which
// is why ViewCounter pauses itself in preview rather than needing a token.
export default function UrqlProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [client] = useState(() => makeUrqlClient(getAPIURL(), "network-only"));

  return <Provider value={client}>{children}</Provider>;
}
