import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import { getPrecisionDateDisplay } from "@/helpers";

export default function PrecisionDate({ data, label }: Props) {
  const date = useFragment(fragment, data);
  const { t } = useTranslation();

  return date && date.value ? (
    <>{`${label ? t(label) : ""} ${getPrecisionDateDisplay(
      date.precision,
      date.value,
    )}`}</>
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  label?: string;
}

const fragment = graphql(`
  fragment PrecisionDateFragment on VariablePrecisionDate {
    precision
    value
  }
`);
