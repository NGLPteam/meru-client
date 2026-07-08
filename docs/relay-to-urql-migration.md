# Migrate meru-client from Relay to urql

## Context

`meru-client` is a Next.js 15 App Router / React 19 app that uses **Relay 16** purely for
read-only GraphQL (159 files with `graphql` tags: 120 fragments, 50 queries, **0 mutations,
0 subscriptions, 0 connection pagination**). The long-term goal is to leave Next.js for a
static site generator; there is no reason for this to be an SPA. **Replacing Relay with urql
is the first step** — it removes the normalized-store + SSR-hydration machinery that only
exists to make Relay's single-environment model work under Next ISR, and collapses the
auth handling that grew around it.

The reference pattern is `../hcc-client/src/lib/api/` (Astro + `@urql/core` +
graphql-codegen **client-preset** with fragment masking). We mirror it: server components
fetch via a `@urql/core` client directly; fragment data is threaded down as plain
serializable refs and unmasked with codegen's `useFragment` (a pure TS-only function that
works in both server and client components). No normalized cache, no `ssrExchange`, no store
hydration is needed. A small urql React `Provider` is added only for the handful of
client-initiated queries.

**Decisions confirmed with the user:**
- Keep fragment masking via graphql-codegen client-preset (lowest churn — 97 `useFragment`
  sites stay structurally identical).
- The 5 client-initiated queries (4 `useRefetchableFragment` + 1 `useQueryLoader`) become
  urql `Provider` + `useQuery`, with the client token fed from `ViewerContext`.
- Breaking changes are fine; we do **not** support Relay and urql in parallel in the final
  state. The branch may run both codegens temporarily during migration (they coexist:
  relay-compiler reads `` graphql`...` `` tagged templates; codegen reads `graphql(`...`)`
  function calls). Nothing merges until the migration is complete.

## Target architecture

New `lib/api/` mirroring `hcc-client/src/lib/api/`:
- **`lib/api/makeUrqlClient.ts`** — `createClient` over `@urql/core` with
  `cacheExchange` + `fetchExchange` (skip `requestPolicyExchange` unless we want client-side
  cache-first; not needed for server fetches). Accepts `url`, `requestPolicy`, `fetchOptions`.
- **`lib/api/measureQuery.ts`** — copy the timing/error-introspection wrapper; a single choke
  point that logs GraphQL errors and rejects on network errors (replaces `network.ts`'s
  `throw new Error` on `json.errors`).
- **`lib/api/client.ts`** — env-configured singletons off `NEXT_PUBLIC_API_URL` (reuse
  `getAPIURL()` logic from `lib/relay/network.ts`), plus `makeAuthorizedClient(token)` that
  sets `authorization: Bearer <token>` (Meru uses `Bearer`, not Craft's `JWT`).
- **`lib/api/queryApi.ts`** — the `queryCraft` analogue and the main server data path:
  `queryApi(query, vars, { token, authAware })`. Resolves the token exactly like today's
  `fetchQuery` (`lib/relay/fetchQuery.ts:14-19`: draft mode OR explicit flag →
  `(await auth())?.accessToken`), picks `makeAuthorizedClient` when a token exists else the
  anonymous singleton, and routes through `measureQuery`. Returns `{ data, error }` — **no
  `records`, no `sessionToken`** to thread.
- **`lib/api/gql/`** — graphql-codegen client-preset output: `graphql()` tag,
  `TypedDocumentNode` map, and `fragment-masking.ts` (`useFragment` + `FragmentType`).
- **`lib/api/UrqlProvider.tsx`** (`"use client"`) — wraps `urql`'s `Provider` with a client
  whose `fetchOptions` reads the current access token from `ViewerContext` (replaces the
  sessionStorage mirror). Only needed for the client-query subtree.

`codegen.ts` (client-preset), replacing/extending the current schema-only codegen:
```ts
{
  schema: "./schema.graphql",              // reuse existing local SDL; or NEXT_PUBLIC_API_URL
  documents: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "contexts/**/*.{ts,tsx}"],
  generates: { "./lib/api/gql/": { preset: "client", config: { useTypeImports: true } } },
}
```

## Migration pattern (applied per file)

**Queries in server components** (`page.tsx` / `layout.tsx`, ~34 `fetchQuery` callers):
```tsx
// before
import { graphql } from "relay-runtime";
import fetchQuery from "@/lib/relay/fetchQuery";
import { pageCollectionTemplateQuery as Query } from "@/relay/pageCollectionTemplateQuery.graphql";
const { data, records, sessionToken } = await fetchQuery<Query>(query, { slug });
return <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
         <MainLayout data={main} /></UpdateClientEnvironment>;
const query = graphql`query pageCollectionTemplateQuery($slug: Slug!) { ... }`;

// after
import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
const { data } = await queryApi(query, { slug });
return <MainLayout data={main} />;   // UpdateClientEnvironment wrapper removed
const query = graphql(`query pageCollectionTemplateQuery($slug: Slug!) { ... }`);
```

**Fragment consumers** (97 files — the bulk, mechanical):
```tsx
// before
import { graphql, useFragment } from "react-relay";
import { EntityPageLayoutFragment$key } from "@/relay/EntityPageLayoutFragment.graphql";
const page = useFragment(fragment, data);
data?: EntityPageLayoutFragment$key | null;
const fragment = graphql`fragment EntityPageLayoutFragment on Page { ... }`;

// after
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
const page = useFragment(fragment, data);
data?: FragmentType<typeof fragment> | null;
const fragment = graphql(`fragment EntityPageLayoutFragment on Page { ... }`);
```
Notes: codegen's `useFragment(doc, ref)` has the same shape as react-relay's, and is a pure
function — `"use client"` components keep working, now receiving real serializable data
objects as props instead of opaque store refs. Type imports move from `@/relay/*` to
`FragmentType<typeof fragment>`. Fragment refs must be spread into a fetched query (already
true under Relay), so the existing prop threading is unchanged.

**Client-initiated queries** (5 files): wrap the relevant subtree in `UrqlProvider`, then:
- 4 `useRefetchableFragment` (`SearchLayout`, `EntityOrderingLayout`, `ContributorDetail`,
  `ArticleAnalyticsBlock`) → `useQuery` from `urql` with variables held in `useState`;
  changing vars (page/order/query) re-runs the query. The `@refetchable`/`@argumentDefinitions`
  fragments become plain queries that take those args as variables. See `SearchLayout.tsx`
  (`components/composed/search/SearchLayout/SearchLayout.tsx`) — `doRefetch` becomes
  `setVars(queryVars)`; child fragment spreads (`SearchResultsFragment`, `SearchFiltersFragment`)
  stay as fragment refs off the query result.
- 1 `useQueryLoader` (`components/composed/analytics/ViewCounter/ViewCounter.tsx`) → fire a
  query on mount via `useQuery` (or `client.query()` from `useClient()`); it records a view
  and renders nothing.

## Stages (simplest first)

**Stage 0 — Scaffolding (no behavior change).**
Add deps: `urql`, `@urql/core`, `@graphql-codegen/client-preset`; keep Relay installed for
now. Build `lib/api/` (makeUrqlClient, measureQuery, client, queryApi). Add `codegen.ts`
client-preset + `graphql` npm script; generate `lib/api/gql/`. Add `@/api/*` tsconfig alias
if desired. Nothing consumes it yet.

**Stage 1 — Pilot one simple leaf feature end-to-end.**
Pick a self-contained, anonymous, no-interactivity subtree (e.g. `contributors/[slug]` or
`files/[file]`): convert its `page.tsx` query to `queryApi` (drop `UpdateClientEnvironment`)
and its fragment consumers to codegen `useFragment`. Verify render + types + build. This
proves the whole pattern before the bulk.

**Stage 2 — Convert all server-fetched queries + fragments (the bulk, ~155 files).**
Feature by feature (collections, communities, items, metrics, metadata, search-shell, global
layout/AppBody, GlobalStaticContext, `lib/actions/fetchPermalink.ts`,
`lib/actions/fetchPreviewAccess.ts`). For each: swap query fetch to `queryApi`, remove the
`UpdateClientEnvironment` wrapper, convert fragment consumers. Root layouts
(`app/[frontend]/layout.tsx`, `app/[frontend]/(pages)/layout.tsx`) drop
`RelayEnvironmentProvider` + `UpdateClientEnvironment`; keep `revalidate` and `ViewerContext`.

**Stage 3 — Client-initiated queries.**
Add `UrqlProvider` (client) around the subtree that needs it (or at the page layout, client
side). Convert the 4 refetchable fragments + ViewCounter to `useQuery`. Wire the client
token from `ViewerContext`.

**Stage 4 — Auth simplification + Relay machinery removal.**
- Delete `lib/auth/token.ts` (sessionStorage mirror) and all `setToken`/`getToken`/
  `removeToken` uses (`lib/relay/environment.ts`, `UpdateClientEnvironment.tsx`,
  `ViewerContext.tsx:55`, `AccountDropdown.tsx handleSignOut`).
- `ViewerContext` keeps fetching `/api/viewer` but stores `accessToken` in context state
  (consumed by `UrqlProvider`'s `fetchOptions`) instead of sessionStorage.
- Delete the Relay network/env/hydration set: `lib/relay/environment.ts`, `network.ts`,
  `apiHeaders.ts`, `fetchQuery.ts`, `RelayClientEnvProvider.tsx`,
  `UpdateClientEnvironment.tsx`, `loadSerializableQuery.ts`,
  `useSerializablePreloadedQuery.ts`, `types.d.ts`. (The `"zardoz"` placeholder token in
  `loadSerializableQuery.ts` is dead code, removed with it.)
- **Keep unchanged** (not Relay-coupled): `lib/auth/initAuth.ts`, `lib/auth/keycloak.ts`
  (token refresh), `app/api/auth/[...nextauth]/route.ts`, `AccountDropdown/actions.ts`
  (sign in/out/logout), `middleware.ts` gating, `draftMode` flows, `app/api/viewer/route.ts`
  (still returns `accessToken`, now consumed via context), and the `ViewerContext` shape +
  its consumers (`canAccessAdmin`, `canPreview`, `allowedActions`).

**Stage 5 — Remove Relay entirely.**
Delete `__generated__/`, `relay.config.js`, the `relay` block in `next.config.js`, the
`@/relay/*` alias in `tsconfig.json`, and deps (`react-relay`, `relay-runtime`,
`relay-compiler`, `@types/react-relay`, `@types/relay-runtime`, `eslint-plugin-relay`) and
the `relay` npm script. Decide whether the schema-only codegen (`types/graphql-schema.d.ts`,
used e.g. for `EntityOrder`) stays as a second codegen output or is subsumed — the
client-preset already emits enum/scalar types, so most `@/types/graphql-schema` imports can
repoint to `lib/api/gql`. Final `npm run build` + typecheck must be clean with zero Relay
references.

## Critical files

- Reference: `../hcc-client/src/lib/api/{makeUrqlClient,measureQuery}.ts`,
  `../hcc-client/src/lib/api/craft/{client,queryCraft}.ts`, `../hcc-client/codegen.mts`.
- Replace: `lib/relay/{fetchQuery,environment,network,apiHeaders}.ts`,
  `lib/relay/{RelayClientEnvProvider,UpdateClientEnvironment,loadSerializableQuery,useSerializablePreloadedQuery}.tsx`.
- Auth: `lib/auth/token.ts` (delete), `contexts/ViewerContext/ViewerContext.tsx`,
  `contexts/ViewerContext/fetchViewer.ts`, `app/api/viewer/route.ts`.
- Config: `relay.config.js`, `next.config.js`, `.graphqlrc.yml`, `tsconfig.json` (aliases),
  `package.json` (deps + scripts), new `codegen.ts`.
- Representative conversions: `app/[frontend]/(pages)/collections/[slug]/page.tsx`,
  `app/[frontend]/(pages)/layout.tsx`,
  `components/composed/entity/EntityPageLayout/EntityPageLayout.tsx`,
  `components/composed/search/SearchLayout/SearchLayout.tsx`,
  `components/composed/analytics/ViewCounter/ViewCounter.tsx`.

## Verification

- **After Stage 0:** `npm run <codegen>` generates `lib/api/gql/` with no errors against the
  schema; typecheck passes.
- **After each conversion stage:** `npx tsc --noEmit` clean for touched files; `npm run build`
  succeeds. Grep the migrated area for residual `from "react-relay"`, `relay-runtime`,
  `@/relay/`, `UpdateClientEnvironment`, `fetchQuery` — expect none.
- **Runtime (use the `run` skill / dev server):** load a converted page and confirm content
  renders (fragments unmask correctly). Exercise search — typing/filtering/paging refetches
  via urql. Confirm auth end-to-end: sign in via Keycloak, `/api/viewer` populates the viewer,
  admin/preview UI gates on `canAccessAdmin`/`canPreview`, draft-mode preview shows unpublished
  content (authorized token reaches the API), sign-out clears state. Confirm anonymous cached
  pages still render without a token.
- **Final:** repo-wide grep for `relay` (case-insensitive) returns only incidental hits;
  `__generated__/` gone; `npm run build` + full typecheck + lint clean.
