"use client";

// Client-side routing hooks — Astro SSR implementations.
//
// These back the app's interactive React islands. Astro serves every route on
// the server and navigations are full document loads, so:
//   - usePathname / useSearchParams read window.location (reactive to popstate)
//   - useRouter drives navigation via window.location / History
//   - useParams reads the route params the .astro page publishes on window
//     (islands get no route context for free — see the __meruRouteParams contract)
//
// Every value is read through useSyncExternalStore so the server-rendered island
// HTML (which has no `window`) hydrates without a mismatch: the server snapshot
// is a neutral default and React re-renders with the real value on the client.
//
// Application code must import routing hooks from here, never from
// "next/navigation" directly.
import { useMemo, useSyncExternalStore } from "react";

type RouteParams = Record<string, string | string[] | undefined>;

declare global {
  interface Window {
    // Published by the .astro page (e.g. from Astro.params) so islands can read
    // route params. Absent until a page opts in.
    __meruRouteParams?: RouteParams;
  }
}

const EMPTY_PARAMS: RouteParams = Object.freeze({});

// Full-page navigation remounts islands, but back/forward (popstate) and in-page
// hash changes mutate the URL in place — subscribe so location-derived hooks stay
// in sync without a reload.
function subscribeLocation(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

// Route params only change on a full navigation (which remounts the island), so
// there is nothing to subscribe to.
function subscribeNever(): () => void {
  return () => {};
}

export function usePathname(): string {
  return useSyncExternalStore(
    subscribeLocation,
    () => window.location.pathname,
    () => "/",
  );
}

// Mirrors next/navigation's read-only contract; consumers copy before mutating.
export type ReadonlyURLSearchParams = URLSearchParams;

export function useSearchParams(): ReadonlyURLSearchParams {
  const search = useSyncExternalStore(
    subscribeLocation,
    () => window.location.search,
    () => "",
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams<T extends RouteParams = RouteParams>(): T {
  return useSyncExternalStore(
    subscribeNever,
    () => (window.__meruRouteParams as T) ?? (EMPTY_PARAMS as T),
    () => EMPTY_PARAMS as T,
  );
}

type NavigateOptions = { scroll?: boolean };

export interface Router {
  // Full-document navigation; `scroll` is accepted for source compatibility and
  // left to the browser (a full load scrolls to top, or to the URL hash).
  push: (href: string, options?: NavigateOptions) => void;
  replace: (href: string, options?: NavigateOptions) => void;
  refresh: () => void;
  back: () => void;
  forward: () => void;
  prefetch: (href: string) => void;
}

export function useRouter(): Router {
  return useMemo<Router>(
    () => ({
      push: (href) => window.location.assign(href),
      replace: (href) => window.location.replace(href),
      refresh: () => window.location.reload(),
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      prefetch: () => {},
    }),
    [],
  );
}
