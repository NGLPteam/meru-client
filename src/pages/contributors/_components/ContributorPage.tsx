"use client";

// Hydrated island: contributor detail embeds BrowseListLayout's Pagination
// (URL-push navigation), so the page body hydrates for now. Splitting the
// static detail from the pagination control is planned alongside the
// search-layout split.
import "@/i18n";
import ContributorDetail from "@/components/composed/contributor/ContributorDetail";
import ContributorDetailNav from "@/components/composed/contributor/ContributorDetailNav";

type Props = {
  contributor: React.ComponentProps<typeof ContributorDetail>["data"];
  navData?: React.ComponentProps<typeof ContributorDetailNav>["data"] | null;
};

export default function ContributorPage({ contributor, navData }: Props) {
  return (
    <>
      {navData && <ContributorDetailNav data={navData} />}
      <ContributorDetail data={contributor} />
    </>
  );
}
