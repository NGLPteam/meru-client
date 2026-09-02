// Transitional React i18n entry: initializes the DEFAULT i18next instance with
// react-i18next for the remaining React islands' useTranslation/<Trans>.
// Server-rendered .astro uses Astro.locals.t instead (same config via
// src/lib/i18n/config.ts). This file is deleted when the last react-i18next
// consumer converts (astroification Phase 8).
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import config from "@/lib/i18n/config";

i18n.use(initReactI18next).init({
  ...config,
  react: {
    transSupportBasicHtmlNodes: true,
  },
});
