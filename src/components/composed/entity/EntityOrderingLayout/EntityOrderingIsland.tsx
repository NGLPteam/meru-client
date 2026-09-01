"use client";

// Hydrated island for browse sub-routes. The ordering layout embeds Pagination
// deep inside the list markup (URL-push navigation reading RouteContext), so
// the whole layout hydrates for now, wrapped in its own RouteProvider.
// Splitting the static list from the pagination control is planned alongside
// the search-layout split.
import "@/i18n";
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";
import EntityOrderingLayout from "./EntityOrderingLayout";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof EntityOrderingLayout> & {
  route?: Partial<RouteState>;
};

export default function EntityOrderingIsland({ route, ...props }: Props) {
  return (
    <RouteProvider route={route}>
      <EntityOrderingLayout {...props} />
    </RouteProvider>
  );
}
