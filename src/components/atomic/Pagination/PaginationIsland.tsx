"use client";

// Island entry for Pagination mounted directly from .astro pages: initializes
// the i18next singleton for BasePagination's labels.
import "@/i18n";
import Pagination from "./Pagination";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Pagination>;

export default function PaginationIsland(props: Props) {
  return <Pagination {...props} />;
}
