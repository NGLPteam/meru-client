import "@/styles/global.css";

import { graphql } from "@/lib/api/gql";
import ThemeProvider from "@/contexts/ThemeProvider";
import queryApi from "@/lib/api/queryApi";
import ILISARNIQ from "@/styles/fonts/ilisarniq";
import SWITZER from "@/styles/fonts/switzer";
import LIBRE_FRANKLIN from "@/styles/fonts/libre-franklin";
import SENTIENT from "@/styles/fonts/sentient";
import { getThemeClasses } from "@/styles/theme-helpers";
import type { PropsWithChildren } from "react";

export const revalidate = 3600;

export default async function RootLayout({ children }: PropsWithChildren) {
  const { data } = await queryApi(query, {});

  const theme = data?.globalConfiguration?.theme;

  return (
    <html
      lang="en"
      dir={"ltr"}
      className={`${ILISARNIQ.variable} ${SWITZER.variable} ${
        LIBRE_FRANKLIN.variable
      } ${SENTIENT.variable} ${getThemeClasses(theme)}`}
    >
      <body>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </body>
    </html>
  );
}

const query = graphql(`
  query layoutThemeQuery {
    globalConfiguration {
      theme {
        color
        font
      }
    }
  }
`);
