import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import get from "lodash/get";
import * as resources from "@/lib/locales";

const DEFAULT_LNG = "en-US";

const SUPPORTED_LOCALES: Record<string, string | undefined> = {};

Object.keys(resources).forEach(
  (key) => (SUPPORTED_LOCALES[key] = get(resources, `${key}.translation.key`)),
);

// The browser LanguageDetector touches window/navigator/document at init, which
// throws when React islands are server-rendered under Astro SSR. The app is
// single-locale and pins the language explicitly (DEFAULT_LNG), so only wire the
// detector up in the browser; the server just uses DEFAULT_LNG.
if (typeof window !== "undefined") {
  i18n.use(LanguageDetector);
}

i18n.use(initReactI18next).init({
  lng: DEFAULT_LNG,
  resources,
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) =>
      format === "number" ? new Intl.NumberFormat(lng).format(value) : value,
  },
  fallbackLng: {
    default: [DEFAULT_LNG],
  },
  react: {
    transSupportBasicHtmlNodes: true,
  },
});

// TODO: Upgrade to ^21.3.0
// i18n.services.formatter?.add("capitalize", (value: string) => {
//   return capitalize(value);
// });
