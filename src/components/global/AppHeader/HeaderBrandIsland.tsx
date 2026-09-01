"use client";

// Left header cluster: installation name/logo + community picker. A cache-safe
// island (no viewer) wrapped in GlobalIslandProviders. Visibility gating
// (community-root vs. elsewhere) is decided server-side in AppHeader.astro; this
// island only renders the cluster.
import classNames from "classnames";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import InstallationName from "@/components/composed/instance/InstallationName";
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";
import { AppHeaderFragment } from "./graphql";
import styles from "./AppHeader.module.css";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

type Props = {
  data?: FragmentType<typeof AppHeaderFragment> | null;
  globalData?: IslandProviderProps["globalData"];
  community?: IslandProviderProps["community"];
  route?: IslandProviderProps["route"];
};

export default function HeaderBrandIsland({
  data,
  globalData,
  community,
  route,
}: Props) {
  const appData = useFragment(AppHeaderFragment, data);
  const withText = appData?.globalConfiguration?.site?.logoMode === "WITH_TEXT";

  return (
    <GlobalIslandProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <span
        className={classNames(styles.installatioName, {
          [styles["installatioName--with-text"]]: withText,
        })}
      >
        <InstallationName data={appData?.globalConfiguration} />
      </span>
      <CommunityPicker data={appData} />
    </GlobalIslandProviders>
  );
}
