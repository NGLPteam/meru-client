import memoryProvider from "astro/cache/memory";
import { COOKIE } from "@/lib/auth/constants";
import type { CacheProvider } from "astro";

const DRAFT_COOKIE_RE = new RegExp(`(?:^|;\\s*)${COOKIE.draftMode}=1(?:;|$)`);

// Wraps Astro's memoryCache so draft-mode requests bypass the cache entirely.
//
// WHY a wrapper: Meru's draft mode is a cookie on the SAME url as public content
// Astro's memoryCache keys purely on url and strips Cookie from Vary,
// so a draft request would be SERVED a previously-cached anonymous (published)
// page. `cache.set(false)` in the page only prevents STORING — it runs during
// render, which a cache HIT skips. So the bypass must happen in onRequest, before
// the lookup. When the draft cookie is present we call next() directly: no lookup
// (never serve stale published content to an editor) and no store (the wrapped
// provider never sees the draft response). See docs/astro-caching-plan.md.
//
export default function draftAwareMemoryProvider(
  config?: Record<string, unknown>,
): CacheProvider {
  const inner = memoryProvider(config);
  return {
    ...inner,
    name: "draft-aware-memory",
    async onRequest(context, next) {
      const cookie = context.request.headers.get("cookie");
      if (cookie && DRAFT_COOKIE_RE.test(cookie)) {
        return next();
      }
      return inner.onRequest!(context, next);
    },
  };
}
