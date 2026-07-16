import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import SearchFilterSelect from "./Filters/SearchFilterSelect";
import SearchFilterInput from "./Filters/SearchFilterInput";
import SearchFilterDate from "./Filters/SearchFilterDate";
import SearchFilterNumber from "./Filters/SearchFilterNumber";
import SearchFilterBoolean from "./Filters/SearchFilterBoolean";

export default function SearchFilter({ data }: Props) {
  const filter = useFragment(fragment, data);

  switch ("type" in filter ? filter.type : undefined) {
    case "SELECT":
      return <SearchFilterSelect data={filter} />;

    case "BOOLEAN":
      return <SearchFilterBoolean data={filter} />;

    case "INTEGER":
      return <SearchFilterNumber data={filter} />;

    case "VARIABLE_DATE":
      return <SearchFilterDate data={filter} />;

    default:
      return <SearchFilterInput data={filter} />;
  }
}

interface Props {
  data: FragmentType<typeof fragment>;
}

const fragment = graphql(`
  fragment SearchFilterFragment on SearchableProperty {
    ... on ScalarProperty {
      type
    }

    ...SearchFilterInputFragment
    ...SearchFilterSelectFragment
    ...SearchFilterDateFragment
    ...SearchFilterNumberFragment
    ...SearchFilterBooleanFragment
  }
`);
