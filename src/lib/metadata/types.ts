// Framework-neutral page metadata.
//
// The app's per-page metadata builders (app/**/_metadata/*.ts) return this shape
// instead of Next's `Metadata`, so the data-gathering logic carries over to the
// Astro SSR migration unchanged; only the framework adapter differs. On Next,
// lib/metadata/toNextMetadata maps this to `Metadata`; on Astro, a .astro layout
// renders <head> tags from the same object.

export type PageMetaImage = { url: string; alt?: string };

export type PageMeta = {
  /** Page <title> text. */
  title?: string;
  /**
   * Title template applied to child page titles, e.g. "%s - Site" (root/site
   * only). When set, the resolved title becomes { default: title, template }.
   */
  titleTemplate?: string;
  /** Meta description. */
  description?: string;
  /** Absolute base URL used to resolve relative metadata URLs (root/site only). */
  baseUrl?: string;
  /** og:url */
  url?: string;
  /** og:site_name */
  siteName?: string;
  /** og:type */
  ogType?: "website" | "article";
  /** og locale, e.g. "en". */
  locale?: string;
  /** This page's own og:images. */
  images?: PageMetaImage[];
  /**
   * When true, this page inherits the parent's Open Graph fields: its og:images
   * are followed by the parent's, and og:site_name / og:type / og:locale /
   * og:description fall back to the parent's. Used by entity subpages that
   * extend the site-level defaults.
   */
  inheritParent?: boolean;
};
