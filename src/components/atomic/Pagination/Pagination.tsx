import { navigate } from "astro:transitions/client";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import BasePagination from "./BasePagination";

export default function Pagination({ data, onPageChange }: Props) {
  const pageData = useFragment(fragment, data);

  // Push query changes. Runs only on user interaction, so the location is read
  // from the window at click time rather than threaded down as props.
  const onSubmit = (val: Record<string, string | number>) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", val.page.toString());
    const url = `${window.location.pathname}?${params.toString()}`;
    navigate(url);
  };

  return pageData?.pageCount && pageData.pageCount > 1 ? (
    <BasePagination
      page={pageData.page}
      pageCount={pageData.pageCount}
      onSubmit={onPageChange ?? onSubmit}
    />
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  onPageChange?: (val: Record<string, string | number>) => void;
}

const fragment = graphql(`
  fragment PaginationFragment on PageInfo {
    page
    pageCount
  }
`);
