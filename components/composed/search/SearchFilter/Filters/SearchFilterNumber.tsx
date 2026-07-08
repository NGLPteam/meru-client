import { Fragment } from "react";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/forms";

export default function SearchFilterNumber({ data }: Props) {
  const filter = useFragment(fragment, data);

  const { register } = useFormContext();

  return filter && filter.searchOperators ? (
    <>
      {filter.searchOperators.map((operator, i) => (
        <Fragment key={i}>
          <Input
            label={filter.label}
            type="number"
            {...register(`${filter.searchPath.replace(".", "-")}--${operator}`)}
          />
          <span className="t-copy-xs t-copy-lighter">
            {filter.searchPath} - {operator}
          </span>
        </Fragment>
      ))}
    </>
  ) : null;
}

interface Props {
  data: FragmentType<typeof fragment>;
}

const fragment = graphql(`
  fragment SearchFilterNumberFragment on SearchableProperty {
    label
    description
    searchPath
    # These are the operators to use as keys in search predicate objects
    # when calling the results field.
    searchOperators
  }
`);
