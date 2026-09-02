import * as resources from "@/lib/locales";

export const DEFAULT_LNG = "en-US";

// Shared i18next options: the server singleton (src/lib/i18n/index.ts, behind
// Astro.locals.t) and the transitional React entry (src/i18n.ts) both init from
// this, so every string resolves identically everywhere. Resources are keyed
// "en" while the language is "en-US" — i18next's built-in language-part
// fallback (en-US → en) bridges that, as it always has.
export default {
  lng: DEFAULT_LNG,
  resources,
  interpolation: {
    escapeValue: false,
    format: (value: unknown, format?: string, lng?: string) =>
      format === "number"
        ? new Intl.NumberFormat(lng).format(value as number)
        : (value as string),
  },
  fallbackLng: {
    default: [DEFAULT_LNG],
  },
};
