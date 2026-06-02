import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";

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

  (await draftMode()).enable();

  redirect(landing(slug));
}
