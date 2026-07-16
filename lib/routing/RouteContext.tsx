"use client";

// Seeds the client-side routing hooks (usePathname / useSearchParams / useParams)
// with the server-known route so island SSR renders the correct route-dependent
// markup and hydration matches exactly — no reflow. The .astro layout/page reads
// these from Astro.url / Astro.params and threads them into each island's
// provider stack; on the client the provider keeps pathname/search in sync with
// History navigation.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

export type RouteParams = Record<string, string | string[] | undefined>;
export type RouteState = {
  pathname: string;
  search: string;
  params: RouteParams;
};

const DEFAULT: RouteState = { pathname: "/", search: "", params: {} };

const RouteContext = createContext<RouteState>(DEFAULT);

export function useRouteState(): RouteState {
  return useContext(RouteContext);
}

type Props = PropsWithChildren<{ route?: Partial<RouteState> }>;

export function RouteProvider({ route, children }: Props) {
  const seeded: RouteState = {
    pathname: route?.pathname ?? DEFAULT.pathname,
    search: route?.search ?? DEFAULT.search,
    params: route?.params ?? DEFAULT.params,
  };

  const [state, setState] = useState<RouteState>(seeded);

  // When a persisted chrome island survives a view-transition navigation, Astro
  // re-renders it with the new page's route prop while keeping React state (so
  // ViewerContext doesn't re-fetch). The useState seed above won't re-run, so
  // re-seed from the new prop when its location changes. Every navigation is a
  // real server render now (including query-string-only search/filter/pagination
  // pushes), so pathname + search together identify the route.
  const seededLocation = `${seeded.pathname}?${seeded.search}`;
  const [prevLocation, setPrevLocation] = useState(seededLocation);
  if (seededLocation !== prevLocation) {
    setPrevLocation(seededLocation);
    setState(seeded);
  }

  useEffect(() => {
    // Full-page navigation remounts islands; popstate/hashchange update the URL
    // in place (params only change with a full navigation, so they're not synced).
    const sync = () =>
      setState((s) => ({
        ...s,
        pathname: window.location.pathname,
        search: window.location.search,
      }));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return (
    <RouteContext.Provider value={state}>{children}</RouteContext.Provider>
  );
}
