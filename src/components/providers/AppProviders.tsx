"use client";

// Provider stack for page-content islands (below the chrome). Reuses the chrome
// stack (GlobalStatic + Viewer + ProgressBar + Community + i18n) and adds
// UrqlProvider, since page content may run client-side queries (search, entity
// ordering, contributor pagination). The chrome itself uses ChromeProviders
// directly — it never issues a client query.
//
// Note: until the same-origin /api/graphql proxy lands (auth phase), the urql
// client points straight at NEXT_PUBLIC_API_URL, so interactive refetches from
// the browser are subject to CORS. Initial content is server-rendered from
// fragment props, so it displays regardless.
import UrqlProvider from "@/lib/api/UrqlProvider";
import ChromeProviders from "../chrome/ChromeProviders";
import type { PropsWithChildren, ComponentProps } from "react";

type Props = PropsWithChildren &
  Omit<ComponentProps<typeof ChromeProviders>, "children">;

export default function AppProviders({ children, ...providerProps }: Props) {
  return (
    <ChromeProviders {...providerProps}>
      <UrqlProvider>{children}</UrqlProvider>
    </ChromeProviders>
  );
}
