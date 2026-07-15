import type { APIContext } from "astro";
import query from "~/lib/query";
import { previewAccessQuery } from "~/lib/queries/preview";

// Astro port of Next `lib/actions/fetchPreviewAccess.ts`. Resolves whether the
// current viewer may preview the given entity (server `canUpdate`), fetched with
// the session token from `locals`. Anonymous → false (query runs token-less and
// canUpdate is false/absent). Unknown entity kinds also resolve false.
export async function fetchPreviewAccess(
  context: APIContext,
  entity: string,
  slug: string,
): Promise<boolean> {
  const token = context.locals.session?.accessToken;

  const { data } = await query(
    previewAccessQuery,
    {
      slug,
      isItem: entity === "items",
      isCollection: entity === "collections",
      isCommunity: entity === "communities",
    },
    token,
  );

  return (
    data?.item?.canUpdate?.value ??
    data?.collection?.canUpdate?.value ??
    data?.community?.canUpdate?.value ??
    false
  );
}
