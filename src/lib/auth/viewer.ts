import type { APIContext } from "astro";
import { resolveViewer } from "@/contexts/ViewerContext/fetchViewer";
import type { ViewerContextProps } from "@/contexts/ViewerContext/ViewerContext";

// Request-scoped viewer resolution (the settled `getViewer` memo). `Astro.locals`
// is one stable object per request, so keying a WeakMap on it collapses the
// chrome (BaseLayout) and each page's content island to ≤1 `viewer` GraphQL query
// per request — without adding an internal field to App.Locals.
//
// Anonymous requests short-circuit to a logged-out viewer with NO network call.
// That matters beyond the happy path: the high-frequency /api/graphql proxy must
// never trigger a viewer fetch, and eager middleware resolution would.
type ViewerHolder = Pick<APIContext, "locals">;

const ANONYMOUS: ViewerContextProps = {
  isAuthenticated: false,
  allowedActions: [],
};

const cache = new WeakMap<App.Locals, Promise<ViewerContextProps>>();

export default function getViewer(
  context: ViewerHolder,
): Promise<ViewerContextProps> {
  const { locals } = context;

  const cached = cache.get(locals);
  if (cached) return cached;

  const token = locals.session?.accessToken;
  const resolved = token ? resolveViewer(token) : Promise.resolve(ANONYMOUS);

  cache.set(locals, resolved);
  return resolved;
}
