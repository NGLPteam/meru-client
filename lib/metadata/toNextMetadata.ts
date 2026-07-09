import type { Metadata, ResolvingMetadata } from "next";
import type { PageMeta } from "./types";

// Adapts a framework-neutral PageMeta (see ./types) to Next's Metadata. This is
// the single metadata module coupled to Next besides the layouts' own
// generateMetadata exports (which the Astro SSR migration replaces with .astro
// <head> rendering that reads the same PageMeta).
//
// `parent` is Next's resolved parent metadata, used only when meta.inheritParent
// is set (entity subpages that extend the site-level Open Graph defaults).
export default async function toNextMetadata(
  meta: PageMeta,
  parent?: ResolvingMetadata,
): Promise<Metadata> {
  const parentOG =
    meta.inheritParent && parent ? (await parent).openGraph : undefined;
  const parentImages = (parentOG?.images as unknown[] | undefined) ?? [];

  const ownImages = (meta.images ?? []).map((i) => ({
    url: i.url,
    ...(i.alt !== undefined && { alt: i.alt }),
  }));
  const images = meta.inheritParent
    ? [...ownImages, ...parentImages]
    : ownImages;

  const openGraph = {
    ...(parentOG ?? {}),
    ...(meta.title !== undefined && { title: meta.title }),
    ...(meta.siteName !== undefined && { siteName: meta.siteName }),
    ...(meta.ogType !== undefined && { type: meta.ogType }),
    ...(meta.locale !== undefined && { locale: meta.locale }),
    // Root pages set og:description; entity subpages inherit the parent's.
    ...(!meta.inheritParent &&
      meta.description !== undefined && { description: meta.description }),
    ...(meta.url && { url: meta.url }),
    ...(images.length > 0 && { images }),
  } as Metadata["openGraph"];

  return {
    ...(meta.titleTemplate !== undefined
      ? { title: { default: meta.title ?? "", template: meta.titleTemplate } }
      : meta.title !== undefined && { title: meta.title }),
    ...(meta.description !== undefined && { description: meta.description }),
    ...(meta.baseUrl && { metadataBase: new URL(meta.baseUrl) }),
    openGraph,
  };
}
