import { siteMetadataQuery } from "@/lib/metadata/siteMetadata.query";
import { getTruncatedText } from "@/helpers/strings";
import type { PageMeta } from "@/lib/metadata/types";
import query from "../query";

// Astro port of app/**/_metadata/site.ts (generateSiteMetadata). Builds the
// site-level PageMeta defaults — title/description/OG that every page inherits
// (and the title template applied to child pages). Uses the Astro server query
// helper + import.meta.env; returns the same framework-neutral PageMeta.
const BASE_URL = import.meta.env.NEXT_PUBLIC_FE_URL as string | undefined;

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
