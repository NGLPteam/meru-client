import { AnyContributor } from "@/types/graphql-schema";
import { fragment as ContributorNameFragment } from "@/components/composed/contributor/ContributorName/ContributorName";
import { type DocumentType } from "@/lib/api/gql";

export function getContributorDisplayName(
  contributor: Partial<AnyContributor> | DocumentType<typeof ContributorNameFragment>,
  reverse?: boolean,
): string {
  if (!contributor) return "";

  switch (contributor.__typename) {
    case "OrganizationContributor":
      return `${contributor.legalName}`;

    case "PersonContributor":
      return reverse
        ? `${contributor.familyName}, ${contributor.givenName}`
        : `${contributor.givenName} ${contributor.familyName}`;

    default:
      return "";
  }
}
