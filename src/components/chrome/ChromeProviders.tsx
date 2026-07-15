"use client";

// Provider stack for the global-chrome islands (AppHeader / AppFooter).
//
// Astro renders each `client:*` component as its own React root, so the chrome
// can't inherit context from an Astro-level wrapper — each chrome island wraps
// itself in this stack, fed server-known data via props.
//
// Deferred vs. the Next (pages)/layout.tsx stack:
//   - UrqlProvider: omitted. No chrome child runs a client useQuery/useMutation,
//     and the client urql bootstrap reads NEXT_PUBLIC_API_URL — that arrives
//     with the same-origin /api/graphql proxy in the auth phase.
//   - ViewerContext is seeded from the server-resolved `viewer` prop (getViewer);
//     the token never reaches the browser and there is no client fetch.
// Side-effect: initialize the i18next singleton (SSR-safe — the browser
// LanguageDetector is only wired under `window`). react-i18next hooks in the
// chrome depend on this having run.
import "@/i18n";
import {
  GlobalStaticContextProvider,
  type GlobalStaticData,
} from "@/contexts/GlobalStaticContext/GlobalStaticContext";
// Import the provider from the module directly, not the barrel — the barrel is
// import-safe now, but the direct path keeps the server fetch out of the graph.
import {
  ViewerContextProvider,
  type ViewerContextProps,
} from "@/contexts/ViewerContext/ViewerContext";
import { CommunityContextProvider } from "@/contexts/CommunityContext";
import ThemeProvider from "@/contexts/ThemeProvider";
import { ProgressBarProvider } from "@/lib/vendor/react-transition-progress";
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
  // Server-resolved viewer (getViewer), seeded so identity renders on the server
  // and after hydration without a client fetch.
  viewer?: ViewerContextProps;
  draftModeEnabled?: boolean;
};

export default function ChromeProviders({
  children,
  globalData,
  community,
  route,
  viewer,
  draftModeEnabled,
}: Props) {
  // Global site theme (color/font) — drives useTheme() consumers (e.g. the
  // analytics charts). Sourced from globalData so it reaches every island
  // without per-page plumbing; the server also applies it as <html> classes.
  const theme = globalData?.globalConfiguration?.theme ?? undefined;

  return (
    <RouteProvider route={route}>
      <GlobalStaticContextProvider globalData={globalData}>
        <ThemeProvider theme={theme}>
          <ViewerContextProvider viewer={viewer} isPreview={draftModeEnabled}>
            <ProgressBarProvider>
              <CommunityContextProvider data={community}>
                {children}
              </CommunityContextProvider>
            </ProgressBarProvider>
          </ViewerContextProvider>
        </ThemeProvider>
      </GlobalStaticContextProvider>
    </RouteProvider>
  );
}
