import type { PageMeta } from "@/lib/metadata/types";

// Framework-neutral resolver — the Astro counterpart of lib/metadata/
// toNextMetadata. Merges the site-level PageMeta (defaults) with an optional
// page-level PageMeta into a flat set of <head> values, applying the same rules
// Next's metadata inheritance did:
//   - the site title template wraps child page titles; the site/home page uses
//     its own title verbatim
//   - inheritParent pages take the site's OG description and append the site's
//     og:images after their own (entity subpages extending the site defaults)
//   - relative URLs resolve against the site baseUrl (Next's metadataBase)
export type ResolvedHead = {
  title?: string;
  description?: string;
  og: {
    title?: string;
    description?: string;
    siteName?: string;
    type?: string;
    locale?: string;
    url?: string;
    images: { url: string; alt?: string }[];
  };
};

function resolveUrl(url: string, baseUrl?: string): string {
  if (!baseUrl) return url;
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

export default function resolvePageMeta(
  site: PageMeta,
  page?: PageMeta,
): ResolvedHead {
  const baseUrl = site.baseUrl ?? page?.baseUrl;
  const mapImages = (imgs: PageMeta["images"]) =>
    (imgs ?? []).map((i) => ({
      url: resolveUrl(i.url, baseUrl),
      ...(i.alt !== undefined && { alt: i.alt }),
    }));

  // Site / home page: the site meta is the page.
  if (!page) {
    return {
      title: site.title,
      description: site.description,
      og: {
        title: site.title,
        description: site.description,
        siteName: site.siteName,
        type: site.ogType,
        locale: site.locale,
        url: site.url ? resolveUrl(site.url, baseUrl) : undefined,
        images: mapImages(site.images),
      },
    };
  }

  const inherit = !!page.inheritParent;

  const title = page.title
    ? site.titleTemplate
      ? site.titleTemplate.replace("%s", page.title)
      : page.title
    : site.title;

  const description = page.description ?? site.description;
  // Inheriting subpages take the site's og:description; others use their own.
  const ogDescription = inherit ? site.description : description;

  // Inheriting subpages append the site's og:images after their own.
  const images = mapImages(
    inherit ? [...(page.images ?? []), ...(site.images ?? [])] : page.images,
  );

  const url = page.url ?? site.url;

  return {
    title,
    description,
    og: {
      title,
      description: ogDescription,
      siteName: page.siteName ?? site.siteName,
      type: page.ogType ?? site.ogType,
      locale: page.locale ?? site.locale,
      url: url ? resolveUrl(url, baseUrl) : undefined,
      images,
    },
  };
}
