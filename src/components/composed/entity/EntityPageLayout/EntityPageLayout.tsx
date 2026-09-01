"use client";

import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { ContentImage, Markdown } from "@/components/atomic";
import styles from "./EntityPageLayout.module.css";

export default function EntityPageLayout({ data }: Props) {
  const page = useFragment(fragment, data);

  return page ? (
    <section
      className={classNames(styles.wrapper, "l-container-wide a-bg-neutral00")}
    >
      <div className={classNames("t-rte", styles.inner)}>
        {page.heroImage && <ContentImage data={page.heroImage} />}
        <h2 className="t-h3">{page.title}</h2>
        <Markdown.Page>{page.body}</Markdown.Page>
      </div>
    </section>
  ) : null;
}

interface Props {
  /* Item data */
  data?: FragmentType<typeof fragment> | null;
  /* Child page content */
  children?: React.ReactNode;
}

const fragment = graphql(`
  fragment EntityPageLayoutFragment on Page {
    title
    body
    heroImage {
      storage
      ...ContentImageFragment
    }
  }
`);
