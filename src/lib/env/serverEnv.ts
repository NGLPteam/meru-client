// Server-side env accessor — the server counterpart of lib/env/clientConfig.ts.
// Reads runtime-first from `process.env`, falling back to `import.meta.env`:
//   - prod (standalone node): the deploy injects vars into `process.env` at
//     runtime, which is authoritative (import.meta.env is baked at build time).
//   - dev (astro dev): Vite loads .env into `import.meta.env` (server-side, all
//     vars) but NOT into `process.env`, so the fallback supplies them.
// Accepts multiple names so renamed vars can keep a legacy fallback during the
// deploy-config transition, e.g. serverEnv("SITE_URL", "NEXT_PUBLIC_FE_URL").
const ime = import.meta.env as unknown as Record<string, string | undefined>;

export default function serverEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key] ?? ime[key];
    if (value) return value;
  }
  return undefined;
}
