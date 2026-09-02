"use client";

// Hydrated filter form mounted from SearchLayout.astro (sidebar and mobile
// drawer instances). Receives the page's location as scalar props so filter
// submissions build URL pushes from it.
import "@/i18n";
import SearchFilters from "./SearchFilters";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof SearchFilters>;

export default function SearchFiltersIsland(props: Props) {
  return <SearchFilters {...props} />;
}
