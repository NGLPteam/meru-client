"use client";

// Provider stack for page-content islands (below the chrome), via AppProviders /
// InstanceContent.
//
// Astro renders each `client:*` component as its own React root, so content can't
// inherit context from an Astro-level wrapper — each content island wraps itself
// in this stack, fed server-known data via props.
//
// Cache-safe: ViewerContext is seeded with ONLY `isPreview` (the draft-mode
// boolean), NEVER the viewer identity. Cached entity pages must not serialize a
// viewer's name/avatar/allowedActions into island hydration props, so identity is
// kept out entirely here; the per-viewer chrome (account nav, footer admin/sign-in)
// renders via `server:defer` islands instead. Content consumers of
// useViewerContext read `isPreview` for the draft gate; identity fields resolve to
// anonymous defaults (so MDX admin error copy is disabled — acceptable).
//
// Deferred vs. the Next (pages)/layout.tsx stack: UrqlProvider omitted (no content
// child runs a client useQuery/useMutation; the two analytics widgets provide
// their own urql client). Side-effect: initialize the i18next singleton (SSR-safe).
import "@/i18n";
import {
  GlobalStaticContextProvider,
  type GlobalStaticData,
} from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import { ViewerContextProvider } from "@/contexts/ViewerContext/ViewerContext";
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
  // Draft/preview mode (from the meru-draft-mode cookie, read server-side). Seeds
  // ViewerContext.isPreview for the content preview gate. NOT viewer identity.
  draftModeEnabled?: boolean;
};

export default function ChromeProviders({
  children,
  globalData,
  community,
  route,
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
          <ViewerContextProvider isPreview={draftModeEnabled}>
            <CommunityContextProvider data={community}>
              {children}
            </CommunityContextProvider>
          </ViewerContextProvider>
        </ThemeProvider>
      </GlobalStaticContextProvider>
    </RouteProvider>
  );
}
