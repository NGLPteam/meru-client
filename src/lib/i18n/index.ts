import i18next from "i18next";
import config, { DEFAULT_LNG } from "./config";

// The i18n singleton behind Astro.locals.t (see
// src/lib/middleware/attachRequestContext.ts) and the direct `t` export below.
const i18n = i18next.createInstance();
i18n.init(config);

// Direct `t` for server-rendered React (MDX components, shared atoms). Client
// islands must NOT import this module — they take translated label props from
// their mounting .astro instead (no i18next in browser bundles).
export const t = i18n.t.bind(i18n);

export { DEFAULT_LNG };
export default i18n;
