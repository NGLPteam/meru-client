# What stays React, and why

Reference for the post-astroification codebase (docs/astroification-plan.md,
Phases 1–7 complete). Everything not listed here is .astro + custom elements.
There are three tiers, in descending order of how hard the constraint is.

## Tier 1 — must stay React (hard constraints)

### The MDX slot pipeline

Template slot content from the WDP backend is MDX. It compiles to
`react/jsx-runtime` calls, so the evaluator and every component MDX content can
name MUST be React components. All of it renders server-side (static output,
zero hydration).

- `templates/mdx/BlockSlotWrapper.tsx`, `templates/mdx/InlineSlotWrapper.tsx` —
  compile + render slot strings; error handling via react-error-boundary and a
  server-side trial render.
- `templates/mdx/components/*` — the component map MDX can reference
  (EntityLink, MetadataItem/Label/Value, VariablePrecisionDate, DotList/DotItem,
  Asset, AssetButton, ButtonLink, CopyLink, HeroSidebarItem, LineBreak,
  PDFViewer, SidebarItem).
- `templates/mdx/getPDFViewerProps.ts` — server helper that evaluates a PDF
  body slot to extract the viewer's props (so the island gets scalars).
- `contexts/ViewerContext.tsx` + `useViewerContext` — the context object the
  slot wrappers read (anonymous default; no provider exists). Phase 8 may swap
  this for a prop/server value.

### The two hydrated island families (React-library wrappers)

The ONLY hydrated React in the app. Both wrap libraries that are themselves
React; replacing them means reimplementing pdf.js / Google Charts integration.

- **PDF viewers** (react-pdf, pdfjs-dist, react-intersection-observer):
  `AssetInlinePDF` (+ `AssetInlinePDFIsland` entry, Nav, Page) — full-text PDF
  bodies, mounted `client:only` from `Detail/Full.astro`;
  `AssetPDFPreview` (+ `AssetPDFPage`) — first-page preview, mounted
  `client:only` from `AssetDetailBlock.astro`. Canvas rendering is inherently
  client-only. `lib/clientOnly.tsx` supports the lazy inner imports.
- **Metrics charts** (react-google-charts): `ArticleAnalyticsBlock` (island
  entry; anonymous @urql/core queries — analytics must be fetched client-side
  so server renders don't count views), `ChartBlock`, `GeoChart`,
  `LineColChart`, `ChartControls` (+ `Switch`, `DateRangeDisclosure`),
  `StatBlocks`. Mode/date-range/chart-type state is genuine client state shared
  across controls, chart, and stat blocks. ChartControls renders the
  `<disclosure-menu>` custom element's markup (React 19) — no reakit.
  The Google Charts loader `<script>` in the shared head is coupled to
  react-google-charts internals; leave verbatim.

### Component-as-prop APIs .astro can't express

.astro templates can't pass React elements as props (only slots/children).

- `templates/OrderingNavigation/NavButtons.tsx` — MDX slot labels rendered into
  `PrevNextButton`'s `label` prop.
- `templates/lists/items/Tree/Accordions.tsx` — recursive tree passing
  `SummaryComponent={<Item/>}` into `TreeAccordion`.
- `templates/ProcessingCheck/EmptyMessage.tsx` — `<Trans>` with component
  interpolation (Phase 8 restructures this to keys + split markup).

## Tier 2 — stays React by the twin policy (shared atoms)

Presentational atoms consumed by Tier 1 React trees (MDX components, the
islands, SearchResults). React can't render .astro, so anything reachable from
those trees keeps its `.tsx`. Per the twin policy there are NO .astro twins:
.astro trees render these statically at zero cost, so one `.tsx` source serves
both worlds. Converting any of them would require duplicating it, not moving it.

- `atomic/links/*` — BaseLink, Link + patterns (DownloadLink, ExternalLink,
  ORCIDLink, ReadMoreLink), NamedLink, NavMenuLink, Breadcrumbs/BreadcrumbLink.
- `atomic/Button` + patterns (BackButton, BackToTopButton, PrevNextButton).
- `factories/IconFactory`, `factories/FileIconFactory`, `svgs/icons/*`.
- `atomic/images/*` — ContentImage, CoverImage (+ CoverPlaceholder), Avatar,
  FileThumbnail, SquareThumbnail.
- `atomic/properties/*` — DOI, ViewCount, DownloadCount, PrecisionDate.
- `atomic/Markdown/*` — BaseMarkdown (react-markdown) + patterns and the
  prop-based `MarkdownContent` wrapper .astro callers use (react-markdown needs
  a string CHILD, which .astro slots can't provide). Phase 8 assesses replacing
  with a server `renderMarkdown()` + `set:html`.
- `atomic` misc — Alert, DotList, PageCount, CloseModalButton,
  TreeAccordion, loading (LoadingBlock, LoadingSpinner).
- `layout` shared wrappers — Container, BackToTopBlock (static markup for the
  custom element), messages (NoContent, ErrorBlock), SkipLink.
- Search-results tree: `SearchResults.tsx` (rendered statically inside the
  SearchResults.astro server island), `EntitySummary`, `ContributionSummary`,
  `templates/lists/List` + `items/*` (Card, Compact, Grid, Promo, Summary,
  Tree) + `SeeAll` — items/Summary is shared by SearchResults and
  EntityOrderingLayout, so the whole list-item family keeps one React source.
- Contributor atoms — ContributorName, ContributorAvatar, ContributorsList
  (used by Hero .astro templates statically and by React trees).

## Tier 3 — React by default (no forcing function)

Static React rendered from .astro pages with zero islands and zero props.
Nothing requires these to convert; doing so is pure churn with no runtime
change. Convert opportunistically only when already rewriting one.

- Instance/home page tree: `InstanceHero`, `InstanceCommunities`,
  `InstanceCommunitySummary`, `InstallationName`.
- Page-body layouts: `EntityPageLayout`, `CommunityPageLayout`,
  `EntityAnnouncementLayout`, `layout/Summary`, `PageMarkdown`.
- Browse leftovers: `BrowseTreeList`/`BrowseTreeItem`,
  `BrowseListLayout/BackButton`.
- Community name/logo: `CommunityName`, `CommunityNameContent`,
  `CommunityLogo`; `ContributorDetailNav`.
- Assets list: `AssetsBlock` (+ `AssetBlockItem`, `AssetThumbnail`).
- `forms/*` (Input, Select, Checkbox, CheckboxGroup, Fieldset, Label) — as of
  Phase 7 these have NO React-tree importers; they render statically from
  .astro search/filter templates. Stateful attributes (`selected`,
  `defaultChecked`) are set by the .astro callers, never via React props.
- `composed/search/SearchBar` — static input markup used by search forms.
- `global/GoogleScholarMetaTags`, `MobileMenuToggle`.
- Plain-function `.tsx` files with no JSX (`templates/FullTextCheck`) — could
  be renamed `.ts`; cosmetic only.

## Dependencies

Installed permanently: `react`, `react-dom`, `@astrojs/react`, `@mdx-js/mdx`,
`react-pdf`, `pdfjs-dist`, `react-google-charts`, `react-error-boundary`,
`react-intersection-observer`, `i18next`, `@urql/core`,
`@urql/exchange-request-policy`.

Removed when they hit grep-zero (Phase 7): `reakit` (+ the `ssr.noExternal`
hack), `urql` (React bindings), `react-hook-form` (Phase 6),
`i18next-browser-languagedetector` (Phase 1).

Going in Phase 8: `react-i18next` (server-rendered React switches to direct
`import { t }`; islands take translated label props); `react-markdown` only if
BaseMarkdown's callers can all move to server-rendered HTML.
