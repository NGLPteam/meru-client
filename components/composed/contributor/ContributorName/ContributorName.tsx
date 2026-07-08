import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { getContributorDisplayName } from "./helpers";

export default function ContributorName({ data }: Props) {
  const contributor = useFragment(fragment, data);

  return contributor ? (
    <span
      dangerouslySetInnerHTML={{
        __html: getContributorDisplayName(contributor),
      }}
    />
  ) : null;
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
  label?: string;
}

export const fragment = graphql(`
  fragment ContributorNameFragment on AnyContributor {
    ... on PersonContributor {
      __typename
      familyName
      givenName
    }
    ... on OrganizationContributor {
      __typename
      legalName
    }
  }
`);
