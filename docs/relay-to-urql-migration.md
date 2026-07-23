# Migrate meru-client from Relay to urql

## Progress status (living checklist)

**STATUS: COMPLETE.** Relay is fully removed; the app builds on urql + graphql-codegen
client-preset. `yarn graphql`, `tsc --noEmit`, `yarn lint`, and `next build` all pass on
branch `migrate-relay-to-urql`. Runtime QA + a dev/build-tooling pass surfaced several
behavioral and tooling issues that are now fixed — see **Post-migration fixes** below.
Not yet merged (pending review).

DONE (committed on branch `migrate-relay-to-urql`):

- Batch 0 scaffold: `lib/api/` (makeUrqlClient, measureQuery, client, queryApi, clientToken,
  UrqlProvider) + `codegen.client.ts` client-preset.
- All ~158 `graphql` tag files converted ` graphql` `` → `graphql()`, imports → `@/lib/api/gql`,
  `$key` → `FragmentType<typeof X>`, `$data` → `DocumentType<typeof X>`, `@inline`/`readInlineData`
  → `useFragment` (aliased `readFragment` in plain helpers), `@arguments`/`@argumentDefinitions`
  removed.
- 4 refetchable fragments → client `useQuery` via `node(id)` refetch (Search/Ordering/
  ContributorDetail/Analytics); ViewCounter → `useQuery` on mount.
- Server data path: every `fetchQuery` → `queryApi`; `UpdateClientEnvironment` removed; root
  `(pages)/layout` swaps Relay providers for `UrqlProvider`; client token flows
  ViewerContext → `clientToken` holder → UrqlProvider.
- **codegen validates all GraphQL documents over the whole repo (glob widened).**

ALSO DONE:

- Type-only `@/relay/` importers repointed to codegen `FragmentType`/`DocumentType`
  (shared fragment consts exported from their defining files).
- AppBody/AppHeader/AppFooter/BrowseListLayout converted (own fragment + sibling refs).
- Relay machinery deleted (`lib/relay/*`, `lib/auth/token.ts`, `__generated__/`,
  `relay.config.js`, `types/graphql-helpers.d.ts`); config cleaned (next.config relay
  block, tsconfig `@/relay` alias, package.json deps + `relay` script,
  eslint-plugin-relay).
- codegen config hardened: `namingConvention: keep`, `dedupeFragments`,
  `futureProofEnums/Unions`, `__typename` added to 6 abstract-type fragments.
- All component-level type fixes: inline-fragment `__typename` narrowing (Relay used to
  flatten), `node(id)` refetch result casts, contributors 3-doc union typing, loosened
  `queryApi` variable input, `readFragment` alias in plain-fn helpers.
- **`yarn graphql` clean; `tsc --noEmit` clean (0 errors).** `next build` = final gate.

REMAINING (historical checklist — now completed above; final verification pending):

1. **Type-only `@/relay/` importers (~24 files)** — files with NO graphql tag that import a
   sibling fragment's `$key`/`$data`/query `$data` type. Fix: `export` the referenced fragment
   const from its defining file (rename to a descriptive exported name, fix internal refs),
   then in the importer use `FragmentType<typeof X>` / `DocumentType<typeof X>`. Map:
   `ArticleAnalyticsBlockFragment`→ChartBlock,StatBlocks; `CommunityNameFragment`→CommunityNameContent;
   `ContributorNameFragment`→ContributorName/helpers.ts; `EntityNavListFragment`→BrowseButton,PagesList;
   `getStaticGoogleScholarDataFragment`→GoogleScholarMetaTags; `SearchModalFragment`→SearchModalContent;
   `CoverImageFragment`→lists.types.ts; `sharedListItemTemplateFragment`→lists/List/List.tsx;
   `getStaticGlobalContextDataQuery`+`getStaticEntityDataFragment`→GlobalStaticContext.tsx;
   `sharedListTemplateFragment`(already exported as `listTemplateFragment`)→lists/blocks/_,items/_.
2. **4 files skipped by agents (cross-file $key):** AppBody, AppHeader, AppFooter,
   BrowseListLayout — convert own fragment tag + own `$key`, and repoint the sibling-prop
`$key` (`SearchButtonFragment`, `CommunityPickerCommunityNameFragment`, `BackButtonFragment`)
to `FragmentType<typeof exportedSibling>`.
3. **Auth/misc repoints:** `contexts/ViewerContext/fetchViewer.ts` (imports `@/lib/relay/apiHeaders`
   → use `getAPIURL` from `lib/api/client` + build headers locally); `types/graphql-helpers.d.ts`
   (imports `relay-runtime`).
4. **Delete Relay machinery:** `lib/relay/*` (environment, network, apiHeaders, fetchQuery,
   RelayClientEnvProvider, UpdateClientEnvironment, loadSerializableQuery,
   useSerializablePreloadedQuery, types.d.ts), `lib/auth/token.ts` (+ `removeToken` use in
   `AccountDropdown.tsx handleSignOut`).
5. **Config/deps:** delete `__generated__/`, `relay.config.js`, `relay` block in `next.config.js`,
   `@/relay/*` alias in `tsconfig.json`, Relay deps + `relay` script in `package.json`. Repoint
   `@/types/graphql-schema` enum imports where useful.
6. **Gate:** `yarn graphql` (done, green) → `npx tsc --noEmit` (fix boundary errors) →
   `npm run lint` (watch react-hooks on any remaining `useFragment` in plain fns) →
   `next build` → runtime verify (render, search, auth/draft-mode).

## Post-migration fixes (runtime QA + dev/build tooling)

Found while running the app after the build first went green. These are the non-obvious
behavioral and tooling differences of the Relay → urql switch — worth knowing for review and
future work.

### Runtime correctness

- **Force POST — `preferGetMethod: false` in `makeUrqlClient`.** urql defaults _queries_ to
  GET; the Meru API only accepts POST and returns 404, which surfaced as
  `Network Error halted: Not Found` on the very first query (`layoutThemeQuery`). Relay always
  POSTed. This affects every operation (server clients + the client Provider).
- **Search — show the loading spinner immediately (`SearchLayout`).** The query was driven off
  `useSearchParams`, which only updates _after_ `router.push` completes an RSC navigation (a
  full round-trip under the `/dynamic` rewrite), so the spinner lagged the submit. Fix: hold
  the query variables in local `useState`, updated synchronously on submit/filter; a
  `useEffect` resyncs from the URL for back/forward; `router.push` runs in parallel — restoring
  Relay's immediate `refetch()`. Also removed a redundant double URL push (SearchFilters
  already pushes). The other client queries were already immediate: ContributorDetail /
  EntityOrderingLayout pagination use local `page` state; ArticleAnalyticsBlock uses local
  `settings`.
- **Analytics date range — `ArticleAnalyticsBlock`.** The `useQuery` variables hardcoded
  `dateRange: {}`, so every range selection ("Last Year", etc.) returned all-time counts. The
  settings reducer computes `settings.dateRange = { startDate }` for week/month/year; fixed by
  passing `settings.dateRange ?? {}`.
  - **Regression class to watch:** a query variable that _should_ be dynamic getting
    hardcoded/dropped during the refetchable → `useQuery` conversion (or `@arguments` removal).
    All 4 interactive components + every server `queryApi` call site were audited against their
    declared variables — this was the only one wrong. (The metrics _page_ intentionally passes
    hardcoded analytics vars for its SSR fetch, which the client block immediately re-fetches
    with real settings, so it's harmless.)

### Perf

- **cache-first public server queries in dev.** client-preset has no normalized cache and
  every client was `network-only`, so repeated public/global queries (theme, global config,
  AppBody) re-fetched on every render/navigation. Added `@urql/exchange-request-policy`; the
  anonymous server client uses `cache-first` with a 30s TTL (`requestPolicyExchange`, see
  `CACHE_TTL_MS`) in **dev** (no route cache there), and stays `network-only` in **production**
  (route-level `revalidate` handles reuse; avoids stale/unbounded caching in a long-lived
  server process). Authed/preview clients and the client-side Provider stay `network-only`.
  Mirrors hcc-client.

### Dev tooling

- **Turbopack dev — `next dev --turbopack`** (`dev:webpack` kept as a fallback). The single
  ~1.6MB generated `lib/api/gql/graphql.ts` (imported by ~183 files) slowed webpack Fast
  Refresh vs Relay's per-artifact files; Turbopack's incremental compilation handles it far
  better. Two wrinkles:
  - **pdfjs `canvas`**: pdfjs v5 dynamically imports `"canvas"` / `@napi-rs/canvas` (not
    installed) — the Turbopack equivalent of the webpack `canvas: false` alias is
    `turbopack.resolveAlias.canvas → lib/stubs/empty.js` (the webpack alias is kept for the
    prod build). PDF rendering verified. Note `AssetPDFPreview` is `dynamic(ssr: false)`, so
    pdfjs only compiles in the browser — a server-side route compile can't exercise it, so the
    alias couldn't be proven removable.
  - **tailwind config**: `require("./styles/helpers")` → `require("./styles/helpers.cjs")` —
    Turbopack's resolver doesn't try the `.cjs` extension for a bare specifier (webpack/jiti
    did).

### Build / lint

- eslint ignores extended to `lib/api/gql/` (the 1.6MB generated file — no value in linting it,
  and it slowed lint) and `lib/stubs/` (the CJS `module.exports` stub tripped `no-undef` in the
  build's lint pass).

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
- **Big-bang on the branch (decided after Stage 0 discovery).** A GraphQL fragment must be
  defined in the same tooling as every operation that spreads it. Shared leaf fragments
  (`SetCommunityFragment` → 4 layouts; `ContributorNameFragment`, `BrowseListLayoutFragment`,
  `ContributorAvatarFragment`, `ContentImageFragment`, thumbnails, avatars…) are spread
  across the whole app, so true per-feature incremental migration collapses into a big-bang
  unless we temporarily duplicate every shared fragment in both systems. We instead convert
  the whole repo in one coordinated pass, committed in logical per-area batches for
  reviewability. Intermediate commits are not expected to build; the **first green
  `next build` + `tsc` is at the end**. The codegen `documents` glob widens to the whole repo
  in the final batch (not incrementally).

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
const { data, records, sessionToken } = await fetchQuery<Query>(query, {
  slug,
});
return (
  <UpdateClientEnvironment records={records} sessionToken={sessionToken}>
    <MainLayout data={main} />
  </UpdateClientEnvironment>
);
const query = graphql`query pageCollectionTemplateQuery($slug: Slug!) { ... }`;

// after
import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
const { data } = await queryApi(query, { slug });
return <MainLayout data={main} />; // UpdateClientEnvironment wrapper removed
const query = graphql(
  `query pageCollectionTemplateQuery($slug: Slug!) { ... }`,
);
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

## Relay directive & API handling

Beyond the mechanical ` graphql` `` → `graphql()` + import/type swaps, these Relay-only
constructs need real conversion (surveyed counts in parens):

- **`@inline` + `readInlineData` (13 files)** — Relay's way to read masked fragment data
  outside React (helpers, context builders, sitemap/metadata). codegen's `useFragment` is a
  _pure identity function at runtime_ (masking is TS-only), so it works fine in plain
  functions: `readInlineData(FooFragment, ref)` → `useFragment(FooFragment, ref)` from
  `@/lib/api/gql`, and drop the `@inline` directive. Files:
  `contexts/GlobalStaticContext/getStatic*.ts`, `helpers/getThumbWithFallback.ts`,
  `helpers/getEntity*.ts`, `helpers/get*Sitemap.ts`,
  `components/templates/OrderingNavigation/routes.ts`,
  `components/templates/shared/shared.list.graphql.ts`,
  `components/composed/entity/EntityDescendantsLayout/EntityDescendantsLayout.tsx`.
- **`@refetchable` + `@argumentDefinitions` (4 fragments)** — `SearchLayout`,
  `EntityOrderingLayout`, `ContributorDetail`, `ArticleAnalyticsBlock`. codegen does **not**
  support fragment arguments. Convert each to a standalone client query that declares the
  args as operation variables and is driven by `useQuery` with variables held in `useState`
  (replaces `refetch(vars)`). Child fragment spreads stay as fragment refs off the result.
- **`@arguments` on fragment spreads (4 pages)** — `search/page.tsx`,
  `communities|collections/[slug]/search/page.tsx`, `items/[slug]/metrics/page.tsx`. Drop the
  `@arguments` directive; the page/operation defines the variables and the (now argument-less)
  fragment references them directly. Every operation spreading such a fragment must define
  those variables.
- **`useSerializablePreloadedQuery` / `loadSerializableQuery` / `usePreloadedQuery` /
  `loadQuery`** — the Relay-official Next SSR-preload helpers, effectively unused. Deleted
  outright.
- **`useQueryLoader` (ViewCounter)** — fire the view-recording query on mount via `useQuery`
  (or `useClient().query()`); renders nothing.
- No mutations, subscriptions, `usePaginationFragment`, `@connection`, or `ConnectionHandler`
  exist — nothing to convert there.

## Batches (big-bang on the branch; commits are logical, not independently green)

**Batch 0 — Scaffolding (DONE).** Deps + `lib/api/` + `codegen.client.ts` + `lib/api/gql/`.

**Batch 1 — Shared leaf + `@inline` fragments.** Convert the widely-spread leaf fragments and
all `@inline`/`readInlineData` helpers/contexts to codegen `useFragment`. These unblock
everything downstream. (atomic components, `helpers/*`, `contexts/GlobalStaticContext/*`,
`SetCommunity`/`CommunityContext`, thumbnails/avatars/ContentImage, ContributorName, etc.)

**Batch 2 — Server-fetched pages/layouts + their fragment consumers.** Swap every
`fetchQuery` → `queryApi`; remove `UpdateClientEnvironment` wrappers; convert the ~97
`useFragment` consumers. Root layouts drop `RelayEnvironmentProvider` +
`UpdateClientEnvironment` (keep `revalidate` + `ViewerContext`). Includes
`lib/actions/fetchPermalink.ts`, `lib/actions/fetchPreviewAccess.ts`.

**Batch 3 — Client-initiated queries + `UrqlProvider`.** Add `lib/api/UrqlProvider.tsx`
(client) fed by `ViewerContext`; convert the 4 refetchable fragments + `ViewCounter` to
`useQuery`.

**Batch 4 — Auth simplification + Relay machinery removal.**

- Delete `lib/auth/token.ts` (sessionStorage mirror) and all `setToken`/`getToken`/
  `removeToken` uses (`ViewerContext.tsx`, `AccountDropdown.tsx handleSignOut`, Relay env).
- `ViewerContext` stores `accessToken` in context state (consumed by `UrqlProvider`'s
  `fetchOptions`) instead of sessionStorage.
- Delete the Relay network/env/hydration set: `lib/relay/*` (`environment.ts`, `network.ts`,
  `apiHeaders.ts`, `fetchQuery.ts`, `RelayClientEnvProvider.tsx`, `UpdateClientEnvironment.tsx`,
  `loadSerializableQuery.ts`, `useSerializablePreloadedQuery.ts`, `types.d.ts`). (The
  `"zardoz"` placeholder token is dead code, removed with it.)
- **Keep unchanged** (not Relay-coupled): `lib/auth/initAuth.ts`, `lib/auth/keycloak.ts`,
  `app/api/auth/[...nextauth]/route.ts`, `AccountDropdown/actions.ts`, `middleware.ts`,
  `draftMode` flows, `app/api/viewer/route.ts` (still returns `accessToken`), and the
  `ViewerContext` shape + its consumers (`canAccessAdmin`, `canPreview`, `allowedActions`).

**Batch 5 — Remove Relay + finalize.** Widen `codegen.client.ts` `documents` to the whole
repo; regenerate. Delete `__generated__/`, `relay.config.js`, the `relay` block in
`next.config.js`, the `@/relay/*` alias in `tsconfig.json`, deps (`react-relay`,
`relay-runtime`, `relay-compiler`, `@types/react-relay`, `@types/relay-runtime`,
`eslint-plugin-relay`) and the `relay` script. Repoint `@/types/graphql-schema` imports
(e.g. `EntityOrder`) at `lib/api/gql` where possible. **First full green `next build` + `tsc`

- lint here.**

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
