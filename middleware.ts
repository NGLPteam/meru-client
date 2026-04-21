import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { fetchPermalink } from "@/lib/actions/fetchPermalink";
import { getRouteByEntityKind } from "@/helpers/routes";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const host = (await headers()).get("host");

  const pathname = request.nextUrl.pathname;

  const searchParams = request.nextUrl.searchParams;
  const paramsString =
    searchParams.size > 0 ? `?${request.nextUrl.searchParams}` : "";

  if (
    process.env.NODE_ENV === "production" &&
    (await headers()).get("x-forwarded-proto") !== "https" &&
    !host?.includes("localhost")
  ) {
    return NextResponse.redirect(
      `https://${host}${pathname}${paramsString}`,
      301,
    );
  }

  if (pathname.startsWith("/permalink")) {
    const permalink = pathname.split("/")?.[2];

    if (permalink) {
      const { kind, permalinkableSlug } = await fetchPermalink(permalink);

      if (kind && permalinkableSlug) {
        const entityPath = `/${getRouteByEntityKind(
          kind,
        )}/${permalinkableSlug}`;
        return NextResponse.rewrite(
          new URL(`/dynamic${entityPath}${paramsString}`, request.url),
        );
      }
    }
  }

  // Because we need runtime env vars, we need to avoid generating any pages at
  // buildtime. This (or any) top-level dyanmic segment ensures we opt all
  // routes out of Next's buildtime generation.
  return NextResponse.rewrite(
    new URL(`/dynamic${pathname}${paramsString}`, request.url),
  );
}
