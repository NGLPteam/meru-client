"use client";

// Hydrated island for browse sub-routes. The ordering layout embeds Pagination
// deep inside the list markup, so the whole layout hydrates for now. Splitting
// the static list from the pagination control is planned alongside the
// search-layout split.
import "@/i18n";
import EntityOrderingLayout from "./EntityOrderingLayout";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof EntityOrderingLayout>;

export default function EntityOrderingIsland(props: Props) {
  return <EntityOrderingLayout {...props} />;
}
