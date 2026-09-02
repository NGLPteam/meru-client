"use client";

// Provider stack for the NON-viewer header/footer islands (header nav,
// community picker, search, footer nav). Cache-safe: unlike AppProviders it
// carries NO ViewerContext, so nothing viewer-specific is serialized into an
// island's hydration props (and therefore never into cached page HTML). The
// per-viewer account UI is rendered separately by the AccountNav / FooterNav
// `server:defer` islands, which resolve the viewer per-request and opt out of the
// cache.
//
// Astro renders each `client:*` component as its own React root, so an island
// can't inherit context from an Astro-level wrapper — each one wraps itself in
// this stack, fed server-known data via props.
//
// Side-effect: initialize the i18next singleton (SSR-safe — the browser
// LanguageDetector is only wired under `window`). react-i18next hooks in the
// header/footer depend on this having run.
import "@/i18n";
import {
  GlobalStaticContextProvider,
  type GlobalStaticData,
} from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import ThemeProvider from "@/contexts/ThemeProvider";
import type { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  globalData?: GlobalStaticData;
};

export default function GlobalIslandProviders({ children, globalData }: Props) {
  // Global site theme (color/font) — drives useTheme() consumers. Sourced from
  // globalData so it reaches every island without per-page plumbing; the server
  // also applies it as <html> classes.
  const theme = globalData?.globalConfiguration?.theme ?? undefined;

  return (
    <GlobalStaticContextProvider globalData={globalData}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </GlobalStaticContextProvider>
  );
}
