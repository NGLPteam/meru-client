# Prep work for moving meru-client off Next.js onto a static site generator (likely Astro)

Status: planning. The relay→urql migration (`docs/relay-to-urql-migration.md`) is the
data-layer prerequisite and is in progress on branch `migrate-relay-to-urql`. This doc
covers everything else we can and should do **before** undertaking the full framework
migration. Target is likely Astro, but not finalized.

## The thing to understand first

This app is **deliberately architected to defeat static generation**, and unwinding that is
the real work — not the framework swap. `middleware.ts` rewrites *every* request to a
`/dynamic/*` prefix (the `[frontend]` segment catches the literal string `"dynamic"`),
explicitly to opt every route out of Next's build-time rendering. The comment says why:
*"Because we need runtime env vars, we need to avoid generating any pages at buildtime."*
Tenancy is **per-deployment** — one container per tenant, `NEXT_PUBLIC_API_URL` points at
that tenant's backend — and every response is `no-store`. Nothing is static today, on purpose.

So **"move to a static site generator" is really a rendering-model decision, and it gates
everything else.** See "The rendering-model decision" below.

## Symptom vs. cause: the `/dynamic` segment

Separate the two, because only one of them goes away for free:

- **The symptom** — the `/dynamic` rewrite + `[frontend]` catch segment — is a pure
  Next-App-Router artifact. It exists only because Next's default is "statically generate
  every route at build time *unless* something forces it dynamic." No other framework has
  that default, so the segment disappears the moment we leave Next. We never write this hack
  again.
- **The cause** — *"build one artifact in CI, deploy it to N tenants, render each against a
  per-deploy runtime API URL, bake no content at build time"* — is a real constraint that
  travels with us. Switching stacks doesn't retire it; it just moves where we satisfy it.

How each target rendering mode handles the cause:

- **Astro SSR / hybrid (`output: 'server'` + Node adapter):** every route renders at request
  time by default and server code reads `process.env` at runtime, exactly like a Next server
  component. The requirement is met **natively, no workaround** — nothing pre-renders unless
  a page opts in with `prerender = true`. This is the clean win and the realistic target.
- **Astro as a true static generator (`output: 'static'`):** renders at **build time**, which
  reintroduces the exact problem the `/dynamic` hack was fighting — one build would bake tenant
  A's content and build-time env into HTML served to every tenant. Pure SSG forces either
  build-per-tenant (abandoning "build once") or moving all data fetching to the client.

### The client-side runtime-config wrinkle (does *not* fix itself)

`UrqlProvider.tsx:21` (a `"use client"` component) reads `NEXT_PUBLIC_API_URL` via
`getAPIURL()` (`lib/api/client.ts:5`). `NEXT_PUBLIC_*` is inlined into the browser bundle at
**build** time, so the "runtime, per-deploy" story already has a hole on the client: one build
can't serve two tenants with different API URLs to the browser without rebuilding. Any target
stack forces us to answer this explicitly. Two options:

1. **Runtime env injection** — the server emits the tenant's API URL into the page
   (`<script>window.__ENV__ = …</script>` or Astro `locals`) and the client reads that instead
   of a build-inlined constant.
2. **Same-origin proxy** — the browser always calls a relative `/graphql` (or `/api/*`) on its
   own origin and the server forwards to the tenant's real backend. The client never needs the
   URL; CORS/token handling simplifies. Usually the cleaner fit for build-once/run-many-tenants
   and dovetails with an Astro-SSR adapter.

## The rendering-model decision (#0 — settle this first)

Decide the static-vs-request-time split before any framework work. Pure SSG can't do what this
app relies on: per-request auth (`draftMode`, `/preview/*` gating in `middleware.ts`), a
per-*deploy* API URL resolved at runtime, and the client queries (search/analytics/view-counter).
The realistic target is **Astro SSR/hybrid**, marking only genuinely-public content pages
`prerender = true`.

Deliverable: an inventory partitioning routes into **static** (public content pages) vs.
**request-time** (auth, `/preview`, search, view-counting, analytics). This reshapes every step
below. Surface it to whoever owns the "target is Astro/SSG" call.

## Biggest asset: `../hcc-client`

The sibling repo is **already Astro + `@urql/core` + graphql-codegen client-preset** — the exact
target stack, with `astro.config.ts`, `codegen.mts`, flat eslint, `knip.jsonc`, and an
`astro7-css-diff.md`. The relay→urql migration is explicitly mirroring its `lib/api/`. Treat
hcc-client as the reference implementation for every decision below (auth, CSS pipeline, codegen,
project conventions).

## Prep steps doable now, on Next, that shrink the migration

All framework-agnostic refactors — mergeable to `main` independently, no Astro required. Ordered
by leverage.

1. **Decouple `next/navigation` behind a thin routing shim — highest leverage.** Largest coupling
   surface: **51 imports across 49 files** (`usePathname`, `useRouter`, `useSearchParams`,
   `useParams`, `redirect`, `notFound`). Wrap each in a local module (`@/lib/routing`) that
   re-exports Next's today; on Astro we re-point ~5 shim files instead of 49. Same play for the 2
   `next/link` files (a `<Link>` wrapper) and `next/head` (1).
2. **Move fonts off `next/font` → `@font-face` in CSS (4 files).** No Astro equivalent; fonts
   already live in `styles/fonts/`. Plain `@font-face` works identically in both frameworks.
   Drop the dependency.
3. **Replace `next/dynamic` (4 files) with `React.lazy`/`Suspense` or static imports.**
   Framework-neutral; removes a Next-only API.
4. **Keep pushing metadata into pure functions.** Good pattern already exists — `generateMetadata`
   bodies delegate to `_metadata/*.ts`. Make those return plain serializable data (drop the `next`
   `Metadata` type, 8 files) so the Astro side renders `<head>` from the same functions.
5. **Isolate `next/headers` (9 files: `draftMode`, `headers`).** Already mostly funneled through
   `lib/actions/*` and `ViewerContext`. Get *all* request-context reads behind a couple of
   accessors so the Astro port swaps `Astro.request`/`Astro.locals` in one place. Also make
   `queryApi`'s token acquisition (currently `auth()` + `draftMode` via `next/headers`) take the
   token as a parameter instead of reaching into Next internals.
6. **Image component is already clean.** `CoverImage` is plain `<img>` + CSS modules + a GraphQL
   fragment — **zero `next/image` usage**. No image-pipeline migration needed; confirm `sharp`
   isn't load-bearing anywhere and drop it if not.

## Harder re-platforming items to design now (don't build yet)

7. **Auth is the second-biggest lift after routing.** On `next-auth@5-beta` + Keycloak, which
   doesn't run on Astro. Good news: `@auth/core` is already a direct dependency
   (framework-agnostic). Check how hcc-client handles auth and design the Astro equivalent
   (Auth.js core + a session accessor) now.
8. **On-demand revalidation has no Astro equivalent.** `/api/revalidate/entity` and `/instance`
   call `revalidatePath` (Next ISR) — the backend-webhook cache-invalidation story. On a
   static/hybrid host this becomes a rebuild trigger or a CDN purge. Design the replacement before
   migrating.
9. **Re-home the middleware logic.** `middleware.ts` does HTTPS redirect, `/preview` auth-gating,
   and `/permalink` → entity-path rewrites. The `/dynamic` opt-out trick disappears entirely; the
   redirect/gate/rewrite logic moves to an Astro middleware or adapter config.
10. **Verify the CSS pipeline ports.** Custom PostCSS stack (`postcss-mixins`, `postcss-nested`,
    oklab, `postcss-assign-layer`, `@castiron/style-mixins`) + Tailwind 3. hcc-client already
    fought this — see its `astro7-css-diff.md`. MDX is minor (only 2 wrapper components, no
    meaningful `MDXRemote` runtime use).

## Suggested sequencing

1. Let the relay→urql branch land first (data-layer enabler; mirrors hcc-client).
2. Land steps **1–6** as independent PRs on `main` while still on Next — each is a strict
   improvement and de-risks the port.
3. In parallel, settle the **rendering-model decision (#0)** and write design docs for **7–9**.
4. Only then start the Astro scaffold, porting the already-decoupled pieces into hcc-client's
   conventions.

Start with #0 (the rendering-model decision) since it gates the rest.

## Next.js coupling surface (measured)

Snapshot of `from "next…"` imports across `app components contexts helpers hooks lib routes`:

| Import               | Count      | Migration note                                              |
| -------------------- | ---------- | ----------------------------------------------------------- |
| `next/navigation`    | 51 / 49 files | Routing shim (step 1) — biggest surface                  |
| `next/headers`       | 9          | Request-context accessors (step 5)                          |
| `next` (`Metadata`)  | 8          | Pure metadata functions (step 4)                            |
| `next/dynamic`       | 4          | `React.lazy` (step 3)                                        |
| `next/font`          | 4          | `@font-face` (step 2)                                        |
| `next/cache`         | 3          | Revalidation redesign (step 8)                              |
| `next/server`        | 2          | Middleware re-home (step 9)                                 |
| `next/link`          | 2          | Link wrapper (step 1)                                        |
| `next/head`          | 1          | Metadata / `<head>` (step 1/4)                              |
| `next/image`         | 0          | Already clean (step 6)                                       |

Server actions (`"use server"`): 4 files — `components/composed/AccountDropdown/actions.ts`,
`components/global/DraftModeBanner/actions.ts`, `lib/actions/fetchPreviewAccess.ts`,
`lib/actions/fetchPermalink.ts`.
