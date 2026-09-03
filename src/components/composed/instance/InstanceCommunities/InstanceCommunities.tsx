"use client";

import classNames from "classnames";
import { t } from "@/lib/i18n";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import InstanceCommunitySummary from "../InstanceCommunitySummary/InstanceCommunitySummary";
import styles from "./InstanceCommunities.module.css";

export default function InstanceCommunities({ data }: Props) {
  const communities = useFragment(fragment, data);

  return communities.edges?.length > 0 ? (
    <section className={classNames("a-bg-neutral90", styles.inner)}>
      <div className="l-container-wide">
        <h2 className={classNames(styles.header, "t-h3")}>
          {t("layouts.instance_communities_header")}
        </h2>
        <ul className={styles.list}>
          {communities.edges.map(({ node }) => (
            <li key={node.slug}>
              <InstanceCommunitySummary data={node} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  ) : null;
}

type Props = {
  data: FragmentType<typeof fragment>;
};

const fragment = graphql(`
  fragment InstanceCommunitiesFragment on CommunityConnection {
    edges {
      node {
        slug
        ...InstanceCommunitySummaryFragment
      }
    }
  }
`);
