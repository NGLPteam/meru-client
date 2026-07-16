import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import NamedLink from "@/components/atomic/links/NamedLink";
import ContributorName from "@/components/composed/contributor/ContributorName";
import ContributorAvatar from "@/components/composed/contributor/ContributorAvatar";
import DotList from "@/components/atomic/DotList";
import styles from "./Contributor.module.css";

export default function Contributor({
  data,
  backParams,
}: {
  data?: FragmentType<typeof fragment> | null;
  backParams?: URLSearchParams;
  slug?: string | null;
}) {
  const attribution = useFragment(fragment, data);

  const { roles, contributor } = attribution ?? {};

  if (!roles || !contributor) return null;

  const href = contributor.slug
    ? backParams
      ? `/contributors/${contributor.slug}?${backParams?.toString()}`
      : `/contributors/${contributor.slug}`
    : "#";

  return (
    <li className={styles.item}>
      <span>
        <ContributorAvatar data={contributor.image} />
      </span>
      <div>
        <NamedLink href={href} className="default-link-styles">
          <strong>
            <ContributorName data={contributor} />
          </strong>
        </NamedLink>
        <div
          className={classNames("t-copy-lighter t-copy-sm", styles.metadata)}
        >
          {!!roles?.length && (
            <DotList>
              {roles.map((r) => (
                <li key={r.identifier}>{r.label}</li>
              ))}
            </DotList>
          )}
          {contributor.affiliation && <p>{contributor.affiliation}</p>}
          {contributor.title && <p>{contributor.title}</p>}
        </div>
      </div>
    </li>
  );
}

const fragment = graphql(`
  fragment ContributorFragment on Attribution {
    roles {
      identifier
      label
    }
    contributor {
      title
      affiliation
      slug
      image {
        ...ContributorAvatarFragment
      }
      ...ContributorNameFragment
    }
  }
`);
