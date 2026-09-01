"use client";

// Hydrated island: contributor detail embeds BrowseListLayout's Pagination
// (URL-push navigation reading RouteContext), so the page body hydrates for
// now, wrapped in its own RouteProvider. Splitting the static detail from the
// pagination control is planned alongside the search-layout split.
import "@/i18n";
import ContributorDetail from "@/components/composed/contributor/ContributorDetail";
import ContributorDetailNav from "@/components/composed/contributor/ContributorDetailNav";
import { RouteProvider, type RouteState } from "@/lib/routing/RouteContext";

type Props = {
  contributor: React.ComponentProps<typeof ContributorDetail>["data"];
  navData?: React.ComponentProps<typeof ContributorDetailNav>["data"] | null;
  route?: Partial<RouteState>;
};

export default function ContributorPage({
  contributor,
  navData,
  route,
}: Props) {
  return (
    <RouteProvider route={route}>
      {navData && <ContributorDetailNav data={navData} />}
      <ContributorDetail data={contributor} />
    </RouteProvider>
  );
}
