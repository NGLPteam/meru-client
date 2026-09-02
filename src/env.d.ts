/// <reference types="astro/client" />

// Request-scoped server state populated by middleware (src/middleware.ts).
// Inline `import(...)` type keeps this file a global script so `namespace App`
// stays global (a top-level import would turn it into a module).
declare namespace App {
  interface Locals {
    isAuthenticated: boolean;
    session?: import("~/lib/auth/session").Session;
    // Attached by attachRequestContext (src/lib/middleware/attachRequestContext.ts).
    t: import("i18next").TFunction<"translation", undefined>;
    // Entity route params — undefined on non-entity routes and on
    // /_server-islands/* requests (which carry the island URL, not the page's).
    slug?: string;
    pageSlug?: string;
  }
}
