import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  (await draftMode()).enable();

  redirect(`/items/${slug}/metadata`);
}
