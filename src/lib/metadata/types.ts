// Framework-neutral page metadata, resolved to <head> tags by
// lib/metadata/resolvePageMeta.

export type PageMetaImage = { url: string; alt?: string };

export type PageMeta = {
  title?: string;
  /** Title template applied to child page titles, e.g. "%s - Site" (root/site only). */
  titleTemplate?: string;
  description?: string;
  /** Absolute base URL used to resolve relative metadata URLs (root/site only). */
  baseUrl?: string;
  url?: string;
  siteName?: string;
  ogType?: "website" | "article";
  locale?: string;
  images?: PageMetaImage[];
  /**
   * When true, this page inherits the parent's Open Graph fields: its og:images
   * are followed by the parent's, and og:site_name / og:type / og:locale /
   * og:description fall back to the parent's. Used by entity subpages that
   * extend the site-level defaults.
   */
  inheritParent?: boolean;
};
