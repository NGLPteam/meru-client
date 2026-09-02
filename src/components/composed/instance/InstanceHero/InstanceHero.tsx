"use client";

import classNames from "classnames";
import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import SearchHero from "@/components/composed/search/SearchHero";
import { Markdown } from "@/components/atomic";
import styles from "./InstanceHero.module.css";

export default function InstanceHero({ data, hideSearchHero }: Props) {
  const app = useFragment(fragment, data);

  return (
    <>
      <header className={classNames("a-bg-custom10", styles.header)}>
        <div className="l-container-wide">
          <h1 className="t-h2">
            {app?.globalConfiguration.site.installationName || "Meru"}
          </h1>
          {app?.globalConfiguration.site.installationHomePageCopy && (
            <div className={styles.text}>
              <Markdown.Summary>
                {app.globalConfiguration.site.installationHomePageCopy}
              </Markdown.Summary>
            </div>
          )}
        </div>
      </header>
      {!hideSearchHero && <SearchHero pathname="/" />}
    </>
  );
}

interface Props {
  data: FragmentType<typeof fragment>;
  // Set by index.astro, which mounts SearchHero itself as a hydrated island
  // (it can't hydrate from inside this statically-rendered tree).
  hideSearchHero?: boolean;
}

const fragment = graphql(`
  fragment InstanceHeroFragment on Query {
    globalConfiguration {
      site {
        providerName
        installationName
        installationHomePageCopy
      }
    }
  }
`);
