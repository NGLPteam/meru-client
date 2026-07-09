// Request-header accessor. Single swap point for the Astro SSR migration
// (Astro.request.headers). Application code must go through this rather than
// importing next/headers directly. Server-only.
//
// next/headers is imported dynamically (never statically) so this module stays
// safe to import from anywhere without tainting a client bundle; the import runs
// only on the server at call time.

export async function getRequestHeader(name: string): Promise<string | null> {
  const { headers } = await import("next/headers");
  return (await headers()).get(name);
}
