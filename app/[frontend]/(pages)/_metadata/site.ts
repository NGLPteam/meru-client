import { graphql } from "@/lib/api/gql";
import queryApi from "@/lib/api/queryApi";
import type { BasePageParams } from "@/types/page";
import { getTruncatedText } from "@/helpers";
import type { PageMeta } from "@/lib/metadata/types";

const BASE_URL = process.env.NEXT_PUBLIC_FE_URL;

export default async function generateSiteMetadata(
  _props: BasePageParams,
): Promise<PageMeta> {
  const { data } = (await queryApi(query, {})) ?? {};

  const config = data?.globalConfiguration;

  const site = config?.site;

  const title = site?.installationName ?? undefined;

  const description = getTruncatedText(site?.installationHomePageCopy || "");

  const image = config?.logo?.original?.url
    ? {
        url: config.logo.original.url,
        alt: config.logoMetadata?.alt || "",
      }
    : null;

  return {
    title,
    titleTemplate: `%s - ${title}`,
    description,
    baseUrl: BASE_URL,
    url: BASE_URL,
    siteName: title,
    ogType: "website",
    locale: "en",
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
  };
}

const query = graphql(`
  query siteMetadataQuery {
    globalConfiguration {
      site {
        installationName
        installationHomePageCopy
      }
      logo {
        original {
          url
        }
      }
      logoMetadata {
        alt
      }
    }
  }
`);
