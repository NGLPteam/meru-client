import { enableDraftMode } from "@/lib/request/draftMode";
import { notFound, redirect } from "@/lib/routing/navigation";

const LANDING: Record<string, (slug: string) => string> = {
  items: (slug) => `/items/${slug}/metadata`,
  collections: (slug) => `/collections/${slug}`,
  communities: (slug) => `/communities/${slug}`,
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entity: string; slug: string }> },
) {
  const { entity, slug } = await params;

  const landing = LANDING[entity];

  if (!landing) notFound();

  await enableDraftMode();

  redirect(landing(slug));
}
