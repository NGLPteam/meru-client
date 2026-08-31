import type { APIContext } from "astro";
import { enableDraftMode } from "~/lib/request/draftMode";
import { fetchPreviewAccess } from "~/lib/preview/fetchPreviewAccess";

// Preview deep-link: enable draft mode for one entity and land on its page.
// Gated: must be authenticated AND have edit access on the target, else bounce
// to /unauthorized with a reason. The per-entity canPreview guard on the
// landing page is the final backstop.
const LANDING: Record<string, (slug: string) => string> = {
  items: (slug) => `/items/${slug}/metadata`,
  collections: (slug) => `/collections/${slug}`,
  communities: (slug) => `/communities/${slug}`,
};

export async function GET(context: APIContext): Promise<Response> {
  const { entity, slug } = context.params;

  const landing = entity ? LANDING[entity] : undefined;
  if (!landing || !slug) return context.rewrite("/404");

  if (!context.locals.isAuthenticated) {
    return context.redirect("/unauthorized?reason=unauthenticated");
  }

  const allowed = await fetchPreviewAccess(context, entity!, slug);
  if (!allowed) {
    return context.redirect("/unauthorized?reason=forbidden");
  }

  enableDraftMode(context);
  return context.redirect(landing(slug));
}
