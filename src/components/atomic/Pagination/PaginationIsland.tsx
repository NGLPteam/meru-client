"use client";

// Hydrated Pagination mounted from .astro pages, wrapped in its own
// RouteProvider so its URL pushes read the page's route rather than the empty
// context default.
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";
import Pagination from "./Pagination";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Pagination> & {
  route?: Partial<RouteState>;
};

export default function PaginationIsland({ route, ...props }: Props) {
  return (
    <RouteProvider route={route}>
      <Pagination {...props} />
    </RouteProvider>
  );
}
