"use client";

// Island entry for SearchButton mounted directly from .astro (the modal is
// React until the search-forms phase); initializes i18next for its labels.
import "@/i18n";
import SearchButton from "./SearchButton";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof SearchButton>;

export default function SearchButtonIsland(props: Props) {
  return <SearchButton {...props} />;
}
