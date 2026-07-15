/// <reference types="astro/client" />

// Request-scoped server state populated by middleware (src/middleware.ts).
// Inline `import(...)` type keeps this file a global script so `namespace App`
// stays global (a top-level import would turn it into a module).
declare namespace App {
  interface Locals {
    isAuthenticated: boolean;
    session?: import("~/lib/auth/session").Session;
  }
}
