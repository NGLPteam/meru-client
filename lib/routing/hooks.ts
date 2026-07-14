"use client";

// Client-side routing hooks — Astro SSR implementations.
//
// These back the app's interactive React islands. Astro serves every route on
// the server and navigations are full document loads.
//   - usePathname / useSearchParams / useParams read the RouteProvider context,
//     which the .astro layout/page seeds from Astro.url / Astro.params. Reading
//     the *server-known* route (rather than a neutral default) means island SSR
//     renders the correct route-dependent markup and hydration doesn't reflow.
//   - useRouter drives navigation via window.location / History (only ever
//     called from event handlers, so it needs no server value).
//
// Application code must import routing hooks from here, never from
// "next/navigation" directly.
import { useMemo } from "react";
import { useRouteState, type RouteParams } from "./RouteContext";

export function usePathname(): string {
  return useRouteState().pathname;
}

// Mirrors next/navigation's read-only contract; consumers copy before mutating.
export type ReadonlyURLSearchParams = URLSearchParams;

export function useSearchParams(): ReadonlyURLSearchParams {
  const { search } = useRouteState();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useParams<T extends RouteParams = RouteParams>(): T {
  return useRouteState().params as T;
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
