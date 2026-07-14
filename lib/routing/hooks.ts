"use client";

// Client-side routing hooks — Astro SSR implementations.
//
// These back the app's interactive React islands. Astro serves every route on
// the server and navigations are full document loads.
//   - usePathname / useSearchParams / useParams read the RouteProvider context,
//     which the .astro layout/page seeds from Astro.url / Astro.params. Reading
//     the *server-known* route (rather than a neutral default) means island SSR
//     renders the correct route-dependent markup and hydration doesn't reflow.
//   - useRouter drives navigation via Astro's client router (view transitions)
//     so navigations are soft swaps with the loading bar rather than full
//     reloads. navigate() falls back to a full load if the ClientRouter isn't
//     present on the page.
//
// Application code must import routing hooks from here, never from
// "next/navigation" directly.
import { useMemo } from "react";
import { navigate } from "astro:transitions/client";
import {
  useRouteState,
  notifyLocationChange,
  type RouteParams,
} from "./RouteContext";

// A push/replace that only changes the query string (search, filters, pagination)
// should update the URL in place — no page load — so the already-mounted island
// re-queries off the new params, matching Next's soft router.push. A different
// pathname is a real navigation (soft view-transition swap).
function isSamePathname(href: string): boolean {
  try {
    return (
      new URL(href, window.location.origin).pathname ===
      window.location.pathname
    );
  } catch {
    return false;
  }
}

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
      push: (href) => {
        if (isSamePathname(href)) {
          window.history.pushState(null, "", href);
          notifyLocationChange();
        } else {
          navigate(href);
        }
      },
      replace: (href) => {
        if (isSamePathname(href)) {
          window.history.replaceState(null, "", href);
          notifyLocationChange();
        } else {
          navigate(href, { history: "replace" });
        }
      },
      refresh: () => navigate(window.location.href, { history: "replace" }),
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      prefetch: () => {},
    }),
    [],
  );
}
