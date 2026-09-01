import { useContext } from "react";
import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { CommunityContext } from "@/contexts/CommunityContext";
import styles from "./CommunityName.module.css";
import CommunityNameContent from "./CommunityNameContent";

export default function CommunityName({ data }: Props) {
  // Mounted from .astro the community arrives as a prop; inside legacy islands
  // it still comes from CommunityContext.
  const contextData = useContext(CommunityContext);
  const community = useFragment(fragment, data ?? contextData);

  return (
    <div
      className={classNames("l-flex l-flex--align-center", styles.wrapper)}
      data-active={!!community}
    >
      {community && <CommunityNameContent community={community} />}
    </div>
  );
}

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

export const fragment = graphql(`
  fragment CommunityNameFragment on Community {
    title
    slug
    logo {
      storage
      original {
        width
        height
      }
      ...CommunityLogoFragment
    }
  }
`);
