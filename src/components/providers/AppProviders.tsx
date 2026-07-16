"use client";

// Provider stack for page-content islands (below the chrome). Reuses the chrome
// stack (GlobalStatic + Viewer + ProgressBar + Community + i18n). Page content
// runs no client-side GraphQL (search/browse/contributor interactions are
// SSR-on-navigation); the two analytics widgets provide their own urql client.
import ChromeProviders from "../chrome/ChromeProviders";
import type { PropsWithChildren, ComponentProps } from "react";

type Props = PropsWithChildren &
  Omit<ComponentProps<typeof ChromeProviders>, "children">;

export default function AppProviders({ children, ...providerProps }: Props) {
  return <ChromeProviders {...providerProps}>{children}</ChromeProviders>;
}
