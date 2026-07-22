"use client";

// Provider stack for the NON-viewer chrome leaf islands (header nav, community
// picker, search, footer nav). Cache-safe: unlike the former ChromeProviders it
// carries NO ViewerContext, so nothing viewer-specific is serialized into a leaf
// island's hydration props (and therefore never into cached page HTML). The
// per-viewer account UI is rendered separately by the AccountNav / FooterAccountNav
// `server:defer` islands, which resolve the viewer per-request and opt out of the
// cache.
//
// Astro renders each `client:*` component as its own React root, so a leaf can't
// inherit context from an Astro-level wrapper — each leaf island wraps itself in
// this stack, fed server-known data via props.
//
// Side-effect: initialize the i18next singleton (SSR-safe — the browser
// LanguageDetector is only wired under `window`). react-i18next hooks in the
// chrome depend on this having run.
import "@/i18n";
import {
  GlobalStaticContextProvider,
  type GlobalStaticData,
} from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import { CommunityContextProvider } from "@/contexts/CommunityContext";
import ThemeProvider from "@/contexts/ThemeProvider";
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";
import type { PropsWithChildren } from "react";

type CommunityRef = React.ComponentProps<
  typeof CommunityContextProvider
>["data"];

type Props = PropsWithChildren & {
  globalData?: GlobalStaticData;
  community?: CommunityRef;
  // Server-known route (pathname/search/params) so route-dependent hooks render
  // the same markup on the server and after hydration — no reflow.
  route?: Partial<RouteState>;
};

export default function ChromeLeafProviders({
  children,
  globalData,
  community,
  route,
}: Props) {
  // Global site theme (color/font) — drives useTheme() consumers. Sourced from
  // globalData so it reaches every island without per-page plumbing; the server
  // also applies it as <html> classes.
  const theme = globalData?.globalConfiguration?.theme ?? undefined;

  return (
    <RouteProvider route={route}>
      <GlobalStaticContextProvider globalData={globalData}>
        <ThemeProvider theme={theme}>
          <CommunityContextProvider data={community}>
            {children}
          </CommunityContextProvider>
        </ThemeProvider>
      </GlobalStaticContextProvider>
    </RouteProvider>
  );
}
