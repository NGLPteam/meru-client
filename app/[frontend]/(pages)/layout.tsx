import { graphql } from "relay-runtime";
import { PropsWithChildren } from "react";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import getStaticGlobalContextData from "@/contexts/GlobalStaticContext/getStaticGlobalContextData";
import { GlobalStaticContextProvider } from "@/contexts/GlobalStaticContext/GlobalStaticContext";
import { ProgressBarProvider } from "@/lib/vendor/react-transition-progress";
import { auth } from "@/lib/auth/initAuth";
import fetchQuery from "@/lib/relay/fetchQuery";
import RelayEnvironmentProvider from "@/lib/relay/RelayClientEnvProvider";
import { layoutAllPagesQuery as Query } from "@/relay/layoutAllPagesQuery.graphql";
import UpdateClientEnvironment from "@/lib/relay/UpdateClientEnvironment";
import { ViewerContextProvider, resolveViewer } from "@/contexts/ViewerContext";
import AppBody from "@/components/global/AppBody";
import { BasePageParams } from "@/types/page";
import ProgressBar from "@/components/atomic/loading/ProgressBar";
import generateSiteMetadata from "./_metadata/site";

export const revalidate = 43200;

export async function generateMetadata(
  props: BasePageParams,
): Promise<Metadata> {
  return generateSiteMetadata(props);
}

export default async function PageLayout({ children }: PropsWithChildren) {
  const globalData = await getStaticGlobalContextData();

  const session = await auth();
  const viewer = await resolveViewer(session?.accessToken);

  const { isEnabled: draftModeEnabled } = await draftMode();

  const { data, records, sessionToken } = await fetchQuery<Query>(query, {});

  return (
    <GlobalStaticContextProvider globalData={globalData}>
      <RelayEnvironmentProvider>
        <ViewerContextProvider {...viewer} isPreview={draftModeEnabled}>
          <UpdateClientEnvironment
            records={records}
            sessionToken={sessionToken}
          >
            <ProgressBarProvider>
              <ProgressBar />
              <AppBody data={data} draftModeEnabled={draftModeEnabled}>
                {children}
              </AppBody>
            </ProgressBarProvider>
          </UpdateClientEnvironment>
        </ViewerContextProvider>
      </RelayEnvironmentProvider>
    </GlobalStaticContextProvider>
  );
}

const query = graphql`
  query layoutAllPagesQuery {
    ...AppBodyFragment
  }
`;
