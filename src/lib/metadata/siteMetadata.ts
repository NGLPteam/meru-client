import { siteMetadataQuery } from "@/lib/metadata/siteMetadata.query";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import query from "../query";
import serverEnv from "../env/serverEnv";

// Builds the site-level PageMeta defaults — title/description/OG that every
// page inherits (and the title template applied to child pages).
const BASE_URL = serverEnv("SITE_URL", "NEXT_PUBLIC_FE_URL");

export default async function getSiteMetadata(): Promise<PageMeta> {
  const { data } = await query(siteMetadataQuery, {});

  const config = data?.globalConfiguration;
  const site = config?.site;

  const title = site?.installationName ?? undefined;
  const description = getTruncatedText(site?.installationHomePageCopy || "");
  const image = config?.logo?.original?.url
    ? { url: config.logo.original.url, alt: config.logoMetadata?.alt || "" }
    : null;

  return {
    title,
    titleTemplate: title ? `%s - ${title}` : undefined,
    description,
    baseUrl: BASE_URL,
    url: BASE_URL,
    siteName: title,
    ogType: "website",
    locale: "en",
    images: image?.url ? [{ url: image.url, alt: image.alt }] : [],
  };
}
