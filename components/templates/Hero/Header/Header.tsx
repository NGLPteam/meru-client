import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import classNames from "classnames";
import type { HeroImageLayout } from "@/types/graphql-schema";
import Alert from "@/components/atomic/Alert";
import TitleBlock from "./HeaderTitleBlock";
import Sidebar from "./HeaderSidebar";
import styles from "./Header.module.css";

export default function HeroHeader({
  data,
  layout,
  hiddenAlert,
}: {
  data?: FragmentType<typeof fragment> | null;
  layout?: HeroImageLayout;
  hiddenAlert?: string;
}) {
  const template = useFragment(fragment, data);

  const { definition } = template ?? {};

  return template ? (
    <>
      {!!hiddenAlert && <Alert message={hiddenAlert} badge color="blue" />}
      <div
        className={
          layout
            ? classNames(styles.columns, {
                [styles["columns--two-column"]]: layout === "TWO_COLUMN",
              })
            : classNames(styles.inner, {
                [styles["inner--split"]]: definition?.showSplitDisplay,
              })
        }
      >
        <TitleBlock layout={layout} data={template} />
        <Sidebar data={template} />
      </div>
    </>
  ) : null;
}

const fragment = graphql(`
  fragment HeaderHeroFragment on HeroTemplateInstance {
    definition {
      showSplitDisplay
    }
    ...HeaderSidebarFragment
    ...HeaderTitleBlockFragment
  }
`);
