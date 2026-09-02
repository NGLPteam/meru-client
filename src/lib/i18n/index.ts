import i18next from "i18next";
import config, { DEFAULT_LNG } from "./config";

// The server-side i18n singleton behind Astro.locals.t (see
// src/lib/middleware/attachRequestContext.ts). A separate instance from the
// React entry (src/i18n.ts): i18next only wires 3rd-party plugins like
// react-i18next at init() time, so sharing one instance would make plugin
// availability depend on import order. Both instances init from the same
// config module, so strings are identical.
const i18n = i18next.createInstance();
i18n.init(config);

export { DEFAULT_LNG };
export default i18n;
