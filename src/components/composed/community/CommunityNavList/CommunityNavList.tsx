import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import CommunityNavListContent from "./CommunityNavListContent";
import styles from "./CommunityNavlist.module.css";

export default function CommunityNavList({
  condensed,
  mobile,
  data,
  pageSlug,
}: Props) {
  const community = useFragment(fragment, data);

  const listClasses = mobile
    ? styles.mobileList
    : classNames(styles.list, { [styles["list--condensed"]]: condensed });

  return (
    <ul className={listClasses} data-condensed={condensed}>
      {community && (
        <CommunityNavListContent
          data={community}
          mobile={mobile}
          pageSlug={pageSlug}
        />
      )}
    </ul>
  );
}

interface Props {
  condensed?: boolean;
  mobile?: boolean;
  data?: FragmentType<typeof fragment> | null;
  pageSlug?: string;
}

const fragment = graphql(`
  fragment CommunityNavListFragment on Community {
    ...CommunityNavListContentFragment
  }
`);
