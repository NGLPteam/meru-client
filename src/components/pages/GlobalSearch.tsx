"use client";

// Hydrated island: top-level global search (/search). Unscoped SearchLayout,
// under the page provider stack (no active community).
import SearchLayout from "@/components/composed/search/SearchLayout";
import type { DocumentType } from "@/lib/api/gql";
import type { GlobalStaticData } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import AppProviders from "../providers/AppProviders";
import type { globalSearchQuery } from "../../lib/queries/search";

type Props = {
  data: DocumentType<typeof globalSearchQuery>;
  globalData?: GlobalStaticData;
  route?: React.ComponentProps<typeof AppProviders>["route"];
};

export default function GlobalSearch({ data, globalData, route }: Props) {
  return (
    <AppProviders globalData={globalData} route={route}>
      <SearchLayout data={data} />
    </AppProviders>
  );
}
