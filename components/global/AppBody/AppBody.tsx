"use client";

import { graphql, useFragment, type FragmentType } from "@/lib/api/gql";
import { updateI18n } from "i18n";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
import { fragment as SearchButtonFragment } from "@/components/atomic/SearchButton/SearchButton";
import { SetCommunityContextProvider } from "@/contexts/CommunityContext";
import SkipLink from "@/components/global/SkipLink";
import DraftModeBanner from "@/components/global/DraftModeBanner";
import AppHeader from "../AppHeader";
import AppFooter from "../AppFooter";
import styles from "./AppBody.module.css";

interface Props {
  children: React.ReactNode;
  data?: FragmentType<typeof fragment> | null;
  searchData?: FragmentType<typeof SearchButtonFragment> | null;
  draftModeEnabled?: boolean;
}

function AppBody({ children, data, searchData, draftModeEnabled }: Props) {
  updateI18n("en");

  const globalData = useFragment(fragment, data);

  const { t } = useTranslation();

  return (
    <div className={classNames("a-bg-neutral00", styles.content)}>
      {draftModeEnabled && <DraftModeBanner />}
      <SkipLink toId="main" label={t("nav.skip_to_content")} />
      <SetCommunityContextProvider>
        <AppHeader data={globalData} searchData={searchData} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <AppFooter data={globalData} />
      </SetCommunityContextProvider>
    </div>
  );
}

export default AppBody;

const fragment = graphql(`
  fragment AppBodyFragment on Query {
    ...AppHeaderFragment
    ...AppFooterFragment
  }
`);
