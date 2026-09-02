"use client";

// Footer body: everything except the per-viewer "Explore" nav — community name /
// installation name, search, about/description, community picker, copyright. A
// cache-safe island (no viewer) wrapped in GlobalIslandProviders. The nav's
// admin/sign-in items are rendered separately by the FooterNav `server:defer`
// island. Grid placement is by named areas (AppFooter.module.css), so DOM order
// vs. the sibling nav island doesn't matter.
import classNames from "classnames";
import { useFragment, type FragmentType } from "@/lib/api/gql";
import InstallationName from "@/components/composed/instance/InstallationName";
import { Search } from "@/components/forms";
import CommunityPicker from "@/components/composed/instance/CommunityPicker";
import CommunityName from "@/components/composed/community/CommunityName";
import { Markdown } from "@/components/atomic";
import { useGlobalStaticContext } from "@/contexts/GlobalStaticContext";
import GlobalIslandProviders from "@/components/providers/GlobalIslandProviders";
import {
  ActiveCommunityFragment,
  type ActiveCommunityRef,
} from "@/components/global/graphql";
import { AppFooterFragment } from "./graphql";
import styles from "./AppFooter.module.css";

type IslandProviderProps = React.ComponentProps<typeof GlobalIslandProviders>;

interface Props {
  data?: FragmentType<typeof AppFooterFragment> | null;
  globalData?: IslandProviderProps["globalData"];
  community?: ActiveCommunityRef;
}

function FooterBody({ data, community }: Pick<Props, "data" | "community">) {
  const staticData = useGlobalStaticContext();
  const activeCommunity = useFragment(ActiveCommunityFragment, community);
  const footer = staticData?.globalConfiguration?.site?.footer;
  const app = useFragment(AppFooterFragment, data);
  const communityCount = app?.communities?.pageInfo?.totalCount || 0;

  return (
    <>
      <div className={styles.communityName}>
        {activeCommunity ? (
          <CommunityName data={activeCommunity} />
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
        {!!activeCommunity && (
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
          {!!activeCommunity && (
            <div className={styles["installationDesktop__name"]}>
              <InstallationName data={app?.globalConfiguration} />
            </div>
          )}
          {communityCount > 1 && (
            <CommunityPicker data={app} activeData={activeCommunity} />
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
  globalData,
  community,
}: Props) {
  return (
    <GlobalIslandProviders globalData={globalData}>
      <FooterBody data={data} community={community} />
    </GlobalIslandProviders>
  );
}
