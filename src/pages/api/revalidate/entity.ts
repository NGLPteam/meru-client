import {
  entityPathFor,
  entityTag,
  isEntityType,
} from "@/lib/caching/constants";
import {
  cacheDisabledResponse,
  guardRevalidate,
} from "@/lib/caching/revalidate";
import type { APIContext } from "astro";

// Entity revalidation webhook (Astro port of app/api/revalidate/entity). Same
// contract as the Next endpoint — DELETE + Bearer + `{ slug, type }` — so the
// backend integration is unchanged. Invalidating the entity's tag clears its
// landing page AND every subpage in one call, since subpages carry the parent
// tag (see entityTag / the per-route cache.set calls). Replaces the old
// baseRoutes path+subroute enumeration.
export async function DELETE(context: APIContext): Promise<Response> {
  const guard = guardRevalidate(context);
  if (!guard.ok) return guard.response;

  const disabled = cacheDisabledResponse(context);
  if (disabled) return disabled;

  const { slug, type } = await context.request.json().catch(() => ({}));

  if (!slug || typeof slug !== "string") {
    return Response.json(
      { revalidated: false, message: "Missing entity slug param." },
      { status: 400 },
    );
  }

  if (!isEntityType(type)) {
    return Response.json(
      { revalidated: false, message: `Unknown entity type: ${type}.` },
      { status: 400 },
    );
  }

  const path = entityPathFor(type, slug);
  const tags = [entityTag(type, slug)];
  await context.cache.invalidate({ path, tags });

  return Response.json({ revalidated: true, path, tags });
}
