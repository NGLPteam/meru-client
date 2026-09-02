import * as resources from "@/lib/locales";

export const DEFAULT_LNG = "en-US";

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
