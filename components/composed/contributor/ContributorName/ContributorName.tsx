import { graphql, useFragment } from "react-relay";
import { ContributorNameFragment$key } from "@/relay/ContributorNameFragment.graphql";
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
  data?: ContributorNameFragment$key | null;
  label?: string;
}

const fragment = graphql`
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
`;
