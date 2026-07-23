"use client";

// Left header cluster: installation name/logo + community picker. A cache-safe
// leaf island (no viewer) wrapped in ChromeLeafProviders. Visibility gating
// (community-root vs. elsewhere) is decided server-side in AppHeader.astro; this
// island only renders the cluster.
import classNames from "classnames";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import InstallationName from "@/components/composed/instance/InstallationName";
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import ChromeLeafProviders from "@/components/chrome/ChromeLeafProviders";
import { AppHeaderFragment } from "./graphql";
import styles from "./AppHeader.module.css";

type LeafProviderProps = React.ComponentProps<typeof ChromeLeafProviders>;

type Props = {
  data?: FragmentType<typeof AppHeaderFragment> | null;
  globalData?: LeafProviderProps["globalData"];
  community?: LeafProviderProps["community"];
  route?: LeafProviderProps["route"];
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
    <ChromeLeafProviders
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
    </ChromeLeafProviders>
  );
}
