"use client";

// Hydrated filter form mounted from SearchLayout.astro (sidebar and mobile
// drawer instances), wrapped in its own RouteProvider so filter submissions
// build URL pushes from the page's route.
import "@/i18n";
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";
import SearchFilters from "./SearchFilters";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof SearchFilters> & {
  route?: Partial<RouteState>;
};

export default function SearchFiltersIsland({ route, ...props }: Props) {
  return (
    <RouteProvider route={route}>
      <SearchFilters {...props} />
    </RouteProvider>
  );
}
