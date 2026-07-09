import { PropsWithChildren } from "react";
import { Metadata } from "next";
import { isDraftModeEnabled } from "@/lib/request/draftMode";
import { graphql } from "@/lib/api/gql";
import getStaticGlobalContextData from "@/contexts/GlobalStaticContext/getStaticGlobalContextData";
import { GlobalStaticContextProvider } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import { ProgressBarProvider } from "@/lib/vendor/react-transition-progress";
import queryApi from "@/lib/api/queryApi";
import UrqlProvider from "@/lib/api/UrqlProvider";
import { ViewerContextProvider } from "@/contexts/ViewerContext";
import AppBody from "@/components/global/AppBody";
import { BasePageParams } from "@/types/page";
import ProgressBar from "@/components/atomic/loading/ProgressBar";
import toNextMetadata from "@/lib/metadata/toNextMetadata";
import generateSiteMetadata from "./_metadata/site";

export const revalidate = 3600;

export async function generateMetadata(
  props: BasePageParams,
): Promise<Metadata> {
  return toNextMetadata(await generateSiteMetadata(props));
}

export default async function PageLayout({ children }: PropsWithChildren) {
  const globalData = await getStaticGlobalContextData();

  const draftModeEnabled = await isDraftModeEnabled();

  const { data } = await queryApi(query, {});

  return (
    <GlobalStaticContextProvider globalData={globalData}>
      <ViewerContextProvider isPreview={draftModeEnabled}>
        <UrqlProvider>
          <ProgressBarProvider>
            <ProgressBar />
            <AppBody data={data} draftModeEnabled={draftModeEnabled}>
              {children}
            </AppBody>
          </ProgressBarProvider>
        </UrqlProvider>
      </ViewerContextProvider>
    </GlobalStaticContextProvider>
  );
}

const query = graphql(`
  query layoutAllPagesQuery {
    ...AppBodyFragment
  }
`);
