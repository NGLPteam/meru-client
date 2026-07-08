import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/forms";

export default function SearchFilterBoolean({ data }: Props) {
  const filter = useFragment(fragment, data);

  const { register } = useFormContext();

  // Checkbox are never search "in" - just "equals"
  return (
    <Checkbox
      label={filter.label}
      value="true"
      {...register(`${filter.searchPath.replace(".", "-")}--equals`)}
    />
  );
}

interface Props {
  data: FragmentType<typeof fragment>;
}

const fragment = graphql(`
  fragment SearchFilterBooleanFragment on SearchableProperty {
    label
    description
    searchPath
    # These are the operators to use as keys in search predicate objects
    # when calling the results field.
    searchOperators
  }
`);
