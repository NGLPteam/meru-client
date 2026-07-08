"use client";

import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { useTranslation } from "react-i18next";
import AssetBlockItem from "./AssetBlockItem";
import styles from "./AssetsBlock.module.css";

const AssetsBlock = ({ data }: Props) => {
  const { t } = useTranslation();
  const files = useFragment(fragment, data);

  return (
    <section className={`a-bg-neutral00`}>
      <div className={classNames("l-container-wide", styles.inner)}>
        <h3 className="t-capitalize">{t("glossary.files_other")}</h3>
        {files?.edges && files.edges.length > 0 ? (
          <ul className={styles.list}>
            {files.edges.map(({ node }, i) => (
              <li className={styles.item} key={i}>
                <AssetBlockItem key={i} data={node} />
              </li>
            ))}
          </ul>
        ) : (
          <p>No files found.</p>
        )}
      </div>
    </section>
  );
};

interface Props {
  data?: FragmentType<typeof fragment> | null;
}

export default AssetsBlock;

const fragment = graphql(`
  fragment AssetsBlockFragment on AssetConnection {
    edges {
      node {
        ...AssetBlockItemFragment
      }
    }
  }
`);
