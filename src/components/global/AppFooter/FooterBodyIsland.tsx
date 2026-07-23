"use client";

// Footer body: everything except the per-viewer "Explore" nav — community name /
// installation name, search, about/description, community picker, copyright. A
// cache-safe leaf island (no viewer) wrapped in ChromeLeafProviders. The nav's
// admin/sign-in items are rendered separately by the FooterNav `server:defer`
// island. Grid placement is by named areas (AppFooter.module.css), so DOM order
// vs. the sibling nav island doesn't matter.
import { useContext } from "react";
import classNames from "classnames";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import InstallationName from "@/components/composed/instance/InstallationName";
import { Search } from "@/components/forms";
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import { communityNameFragment as CommunityPickerCommunityNameFragment } from "@/components/composed/instance/CommunityPicker/CommunityPicker";
import CommunityName from "@/components/composed/community/CommunityName";
import { Markdown } from "@/components/atomic";
import { useGlobalStaticContext } from "@/contexts/GlobalStaticContext";
import { CommunityContext } from "@/contexts/CommunityContext";
import ChromeLeafProviders from "@/components/chrome/ChromeLeafProviders";
import { AppFooterFragment } from "./graphql";
import styles from "./AppFooter.module.css";

type LeafProviderProps = React.ComponentProps<typeof ChromeLeafProviders>;

interface Props {
  data?: FragmentType<typeof AppFooterFragment> | null;
  communityData?: FragmentType<
    typeof CommunityPickerCommunityNameFragment
  > | null;
  globalData?: LeafProviderProps["globalData"];
  community?: LeafProviderProps["community"];
  route?: LeafProviderProps["route"];
}

function FooterBody({
  data,
  communityData,
}: Pick<Props, "data" | "communityData">) {
  const staticData = useGlobalStaticContext();
  const community = useContext(CommunityContext);
  const footer = staticData?.globalConfiguration?.site?.footer;
  const app = useFragment(AppFooterFragment, data);
  const communityCount = app?.communities?.pageInfo?.totalCount || 0;

  return (
    <>
      <div className={styles.communityName}>
        {community ? (
          <CommunityName />
        ) : (
          <h4>
            <InstallationName
              className="t-h4"
              data={app?.globalConfiguration}
            />
          </h4>
        )}
      </div>
      <div className={styles.search}>
        <Search id="footerSearch" />
      </div>
      <div className={styles.searchMobile}>
        <Search mobile id="footerMobileSearch" />
      </div>
      <div className={styles.about}>
        {!!community && (
          <div className={styles.installationMobile}>
            <InstallationName data={app?.globalConfiguration} />
          </div>
        )}
        {footer?.description && (
          <Markdown.Base className="t-copy-sm t-copy-lighter">
            {footer?.description}
          </Markdown.Base>
        )}
        <div className={styles.installationDesktop}>
          {!!community && (
            <div className={styles["installationDesktop__name"]}>
              <InstallationName data={app?.globalConfiguration} />
            </div>
          )}
          {communityCount > 1 && (
            <CommunityPicker data={app} activeData={communityData} />
          )}
        </div>
      </div>
      {footer?.copyrightStatement && (
        <p className={classNames("t-copy-sm t-copy-light", styles.copyright)}>
          {`© ${footer?.copyrightStatement}`}
        </p>
      )}
    </>
  );
}

export default function FooterBodyIsland({
  data,
  communityData,
  globalData,
  community,
  route,
}: Props) {
  return (
    <ChromeLeafProviders
      globalData={globalData}
      community={community}
      route={route}
    >
      <FooterBody data={data} communityData={communityData} />
    </ChromeLeafProviders>
  );
}
